const SaidaRepository = require('../repositories/saidaRepository');

class SaidaService {
    async listarSaidas() {
        const saidas = await SaidaRepository.findAll();
        return {
            sucesso: true,
            mensagem: "Saídas listadas com sucesso",
            dados: saidas
        };
    }

    async buscarSaidaPorId(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }

        const saida = await SaidaRepository.findById(id);
        if (!saida) {
            throw { status: 404, mensagem: "Registro de saída não encontrado" };
        }

        return {
            sucesso: true,
            mensagem: "Registro de saída encontrado com sucesso",
            dados: saida
        };
    }

    async cadastrarSaida(dados) {
        const { ID_entrada, Data_saida, Nome_produto, ID_produto, Setor_produto, ID_lote } = dados || {};

        if (!ID_entrada || !Data_saida || !Nome_produto || !ID_produto || !Setor_produto || !ID_lote) {
            throw { status: 400, mensagem: "Todos os campos obrigatórios (ID_entrada, Data_saida, Nome_produto, ID_produto, Setor_produto, ID_lote) devem ser preenchidos" };
        }

        const id = await SaidaRepository.create(dados);
        return {
            sucesso: true,
            mensagem: "Registro de saída cadastrado com sucesso",
            id
        };
    }

    async atualizarSaida(id, dadosAtualizacao) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }

        const saidaAntiga = await SaidaRepository.findById(id);
        if (!saidaAntiga) {
            throw { status: 404, mensagem: "Registro de saída não encontrado para atualização" };
        }

        const { ID_entrada, Data_saida, Nome_produto, ID_produto, Setor_produto, ID_lote } = dadosAtualizacao || {};
        if (!ID_entrada || !Data_saida || !Nome_produto || !ID_produto || !Setor_produto || !ID_lote) {
            throw { status: 400, mensagem: "Todos os campos obrigatórios devem ser fornecidos para atualização" };
        }

        await SaidaRepository.update(id, dadosAtualizacao);

        return {
            sucesso: true,
            mensagem: "Registro de saída atualizado com sucesso"
        };
    }

    async deletarSaida(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }

        const saida = await SaidaRepository.findById(id);
        if (!saida) {
            throw { status: 404, mensagem: "Registro de saída não encontrado" };
        }

        await SaidaRepository.delete(id);

        return {
            sucesso: true,
            mensagem: "Registro de saída apagado com sucesso"
        };
    }
}

module.exports = new SaidaService();