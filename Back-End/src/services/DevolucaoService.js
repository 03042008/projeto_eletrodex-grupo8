const DevolucaoRepository = require('../repositories/DevolucaoRepository');

class DevolucaoService {
  async listar() {
    const dados = await DevolucaoRepository.listar();
    return { sucesso: true, dados, total: dados.length };
  }

  async registrar(dados) {
    const idLote = Number(dados?.id_lote);
    const quantidade = Number(dados?.quantidade);
    const idFuncionario = Number(dados?.id_funcionario);
    const motivo = typeof dados?.motivo === 'string' ? dados.motivo.trim() : '';

    if (!Number.isInteger(idLote) || idLote < 1) {
      throw { status: 400, mensagem: 'Selecione um lote válido.' };
    }
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 2147483647) {
      throw { status: 400, mensagem: 'A quantidade deve ser um inteiro maior que zero.' };
    }
    if (!motivo || motivo.length > 500) {
      throw { status: 400, mensagem: 'Informe o motivo da devolução (até 500 caracteres).' };
    }
    if (!dados?.foto) throw { status: 400, mensagem: 'A foto do produto é obrigatória.' };
    if (!Number.isInteger(idFuncionario) || idFuncionario < 1) {
      throw { status: 401, mensagem: 'Não foi possível identificar o funcionário responsável.' };
    }

    const lote = await DevolucaoRepository.buscarLote(idLote);
    if (!lote) throw { status: 404, mensagem: 'Lote não encontrado.' };

    const id = await DevolucaoRepository.criar({
      id_produto: lote.id_produto,
      id_lote: idLote,
      id_funcionario: idFuncionario,
      quantidade,
      motivo,
      foto: dados.foto,
    });
    return { sucesso: true, mensagem: 'Devolução registrada para análise.', id };
  }

  async atualizarStatus(id, status, revisorId) {
    const devolucaoId = Number(id);
    if (!Number.isInteger(devolucaoId) || devolucaoId < 1) {
      throw { status: 400, mensagem: 'ID de devolução inválido.' };
    }
    if (!['em_analise', 'reintegrada', 'recusada'].includes(status)) {
      throw { status: 400, mensagem: 'Status de devolução inválido.' };
    }
    await DevolucaoRepository.atualizarStatus(devolucaoId, status, revisorId);

    const mensagens = {
      em_analise: 'Devolução movida para análise.',
      reintegrada: 'Devolução aprovada e quantidade reintegrada ao lote.',
      recusada: 'Devolução recusada.',
    };
    return { sucesso: true, mensagem: mensagens[status] };
  }
}

module.exports = new DevolucaoService();