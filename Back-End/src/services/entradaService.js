const EntradaRepository = require('../repositories/entradaRepository');

class EntradaService {
    async listarEntradas() {
        const entradas = await EntradaRepository.findAll();
        return {
            sucesso: true,
            mensagem: "Entradas listadas com sucesso",
            dados: entradas
        };
    }

    async buscarEntradaPorId(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }

        const entrada = await EntradaRepository.findById(id);
        if (!entrada) {
            throw { status: 404, mensagem: "Registro de entrada não encontrado" };
        }

        return {
            sucesso: true,
            mensagem: "Registro de entrada encontrado com sucesso",
            dados: entrada
        };
    }

    async cadastrarEntrada(dados) {
        const { Data_entrada, Nome_produto, ID_produto, Setor_produto, ID_lote } = dados || {};

        if (!Data_entrada || !Nome_produto || !ID_produto || !Setor_produto || !ID_lote) {
            throw { status: 400, mensagem: "Todos os campos obrigatórios (Data_entrada, Nome_produto, ID_produto, Setor_produto, ID_lote) devem ser preenchidos" };
        }

        const id = await EntradaRepository.create(dados);
        return {
            sucesso: true,
            mensagem: "Registro de entrada cadastrado com sucesso",
            id
        };
    }

    async atualizarEntrada(id, dadosAtualizacao) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }

        const entradaAntiga = await EntradaRepository.findById(id);
        if (!entradaAntiga) {
            throw { status: 404, mensagem: "Registro de entrada não encontrado para atualização" };
        }

        const { Data_entrada, Nome_produto, ID_produto, Setor_produto, ID_lote } = dadosAtualizacao || {};
        if (!Data_entrada || !Nome_produto || !ID_produto || !Setor_produto || !ID_lote) {
            throw { status: 400, mensagem: "Todos os campos obrigatórios devem ser fornecidos para atualização" };
        }

        await EntradaRepository.update(id, dadosAtualizacao);

        return {
            sucesso: true,
            mensagem: "Registro de entrada atualizado com sucesso"
        };
    }

    async deletarEntrada(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }

        const entrada = await EntradaRepository.findById(id);
        if (!entrada) {
            throw { status: 404, mensagem: "Registro de entrada não encontrado" };
        }

        await EntradaRepository.delete(id);

        return {
            sucesso: true,
            mensagem: "Registro de entrada apagado com sucesso"
        };
    }
}

module.exports = new EntradaService();