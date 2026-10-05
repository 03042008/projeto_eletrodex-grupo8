const SaidaRepository = require('../repositories/saidaRepository');

class SaidaService {
    async listarSaidas(usuario) {
        const idFuncionario = usuario.nivel === 'Vendedor' ? usuario.id_funcionario : null;
        const saidas = await SaidaRepository.findAll(idFuncionario);
        return {
            sucesso: true,
            mensagem: "Saídas listadas com sucesso",
            dados: saidas
        };
    }

    async buscarSaidaPorId(id, usuario) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }

        const idFuncionario = usuario.nivel === 'Vendedor' ? usuario.id_funcionario : null;
        const saida = await SaidaRepository.findById(id, idFuncionario);
        if (!saida) {
            throw { status: 404, mensagem: "Registro de saída não encontrado" };
        }

        return {
            sucesso: true,
            mensagem: "Registro de saída encontrado com sucesso",
            dados: saida
        };
    }

    async cadastrarSaida(dados, usuario) {
        const { id_entrada, data_saida, nome_produto, id_produto, setor_produto, id_lote } = dados || {};

        if (!id_entrada || !data_saida || !nome_produto || !id_produto || !setor_produto || !id_lote) {
            throw { status: 400, mensagem: "Todos os campos obrigatórios devem ser preenchidos." };
        }

        const id = await SaidaRepository.create({
            id_entrada,
            data_saida,
            nome_produto,
            id_produto,
            setor_produto,
            id_lote,
            id_funcionario: usuario.id_funcionario,
        });
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

        const { id_entrada, data_saida, nome_produto, id_produto, setor_produto, id_lote } = dadosAtualizacao || {};
        if (!id_entrada || !data_saida || !nome_produto || !id_produto || !setor_produto || !id_lote) {
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