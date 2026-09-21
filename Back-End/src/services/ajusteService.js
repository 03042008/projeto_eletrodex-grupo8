const AjusteRepository = require('../repositories/ajusteRepository');

const camposObrigatorios = ['id_produto', 'motivo', 'nota_fiscal', 'id_funcionario'];

function validarId(valor, nome) {
    if (!Number.isInteger(Number(valor)) || Number(valor) <= 0) {
        throw { status: 400, mensagem: `${nome} inválido` };
    }
}

function validarDados(dados) {
    if (!dados || camposObrigatorios.some((campo) => dados[campo] === undefined || dados[campo] === null)) {
        throw { status: 400, mensagem: 'Produto, motivo, nota fiscal e funcionário são obrigatórios' };
    }

    validarId(dados.id_produto, 'ID do produto');
    validarId(dados.id_funcionario, 'ID do funcionário');
    validarId(dados.nota_fiscal, 'Nota fiscal');

    if (typeof dados.motivo !== 'string' || dados.motivo.trim() === '' || dados.motivo.length > 300) {
        throw { status: 400, mensagem: 'Motivo deve ter entre 1 e 300 caracteres' };
    }
}

class AjusteService {
    async listarAjustes() {
        return { sucesso: true, dados: await AjusteRepository.buscarTodos() };
    }

    async buscarAjustePorId(id) {
        validarId(id, 'ID do ajuste');
        const ajuste = await AjusteRepository.buscarId(id);
        if (!ajuste) throw { status: 404, mensagem: 'Ajuste não encontrado' };
        return { sucesso: true, dados: ajuste };
    }

    async cadastrarAjuste(dados) {
        validarDados(dados);
        await this.validarReferencias(dados);
        const id = await AjusteRepository.criar({ ...dados, motivo: dados.motivo.trim() });
        return { sucesso: true, mensagem: 'Ajuste cadastrado com sucesso', id };
    }

    async atualizarAjuste(id, dados) {
        validarId(id, 'ID do ajuste');
        const existente = await AjusteRepository.buscarId(id);
        if (!existente) throw { status: 404, mensagem: 'Ajuste não encontrado' };
        validarDados(dados);
        await this.validarReferencias(dados);
        await AjusteRepository.atualizar(id, { ...dados, motivo: dados.motivo.trim() });
        return { sucesso: true, mensagem: 'Ajuste atualizado com sucesso' };
    }

    async deletarAjuste(id) {
        validarId(id, 'ID do ajuste');
        const removido = await AjusteRepository.deletar(id);
        if (!removido) throw { status: 404, mensagem: 'Ajuste não encontrado' };
        return { sucesso: true, mensagem: 'Ajuste excluído com sucesso' };
    }

    async validarReferencias(dados) {
        if (!await AjusteRepository.produtoExiste(dados.id_produto)) {
            throw { status: 400, mensagem: 'ID do produto informado não existe' };
        }
        if (!await AjusteRepository.funcionarioExiste(dados.id_funcionario)) {
            throw { status: 400, mensagem: 'ID do funcionário informado não existe' };
        }
    }
}

module.exports = new AjusteService();