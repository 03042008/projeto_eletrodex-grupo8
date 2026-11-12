const NivelRepository = require("../repositories/nivelRepository");

class NivelService {
  async listarNiveis() {
    const niveis = await NivelRepository.buscarTodos();
    return {
      sucesso: true,
      dados: niveis,
      total: niveis.length,
    };
  }

  async buscarNivelPorId(id) {
    if (!id || Number.isNaN(Number(id))) {
      throw { status: 400, mensagem: "ID inválido" };
    }

    const nivel = await NivelRepository.buscarId(id);
    if (!nivel) {
      throw { status: 404, mensagem: "Nível não encontrado" };
    }

    return {
      sucesso: true,
      dados: nivel,
    };
  }

  async cadastrarNivel(dados) {
    const descricao = typeof dados?.descricao === 'string' ? dados.descricao.trim() : '';

    if (!descricao || descricao.length > 100) {
      throw { status: 400, mensagem: "Descrição é obrigatória e deve ter até 100 caracteres." };
    }

    if (await NivelRepository.buscarPorDescricao(descricao)) {
      throw { status: 409, mensagem: "Já existe um nível com essa descrição." };
    }

    const id = await NivelRepository.create({ descricao });

    return {
      sucesso: true,
      mensagem: "Nível cadastrado com sucesso",
      id,
    };
  }

  async atualizarNivel(id, dados) {
    if (!id || Number.isNaN(Number(id))) {
      throw { status: 400, mensagem: "ID inválido" };
    }

    const existe = await NivelRepository.buscarId(id);
    if (!existe) {
      throw { status: 404, mensagem: "Nível não encontrado" };
    }

    const atualizado = {};
    const { descricao } = dados;

    if (descricao !== undefined) {
      const descricaoLimpa = typeof descricao === 'string' ? descricao.trim() : '';
      if (!descricaoLimpa || descricaoLimpa.length > 100) {
        throw { status: 400, mensagem: "Descrição é obrigatória e deve ter até 100 caracteres." };
      }
      const duplicado = await NivelRepository.buscarPorDescricao(descricaoLimpa);
      if (duplicado && Number(duplicado.id_nivel) !== Number(id)) {
        throw { status: 409, mensagem: "Já existe um nível com essa descrição." };
      }
      atualizado.descricao = descricaoLimpa;
    }

    if (Object.keys(atualizado).length === 0) {
      throw {
        status: 400,
        mensagem: "Nenhum dado válido enviado para atualização",
      };
    }

    await NivelRepository.atualizarNivel(id, atualizado);

    return {
      sucesso: true,
      mensagem: "Nível atualizado com sucesso",
    };
  }

  async deletarNivel(id) {
    if (!id || Number.isNaN(Number(id))) {
      throw { status: 400, mensagem: "ID inválido" };
    }

    const existe = await NivelRepository.buscarId(id);
    if (!existe) {
      throw { status: 404, mensagem: "Nível não encontrado" };
    }

    if (existe.descricao === 'Administrador') {
      throw { status: 409, mensagem: "O nível Administrador não pode ser removido." };
    }
    if (await NivelRepository.contarFuncionarios(id)) {
      throw { status: 409, mensagem: "Não é possível remover um nível atribuído a funcionários." };
    }

    await NivelRepository.deletarNivel(id);

    return {
      sucesso: true,
      mensagem: "Nível apagado com sucesso",
    };
  }
}

module.exports = new NivelService();
