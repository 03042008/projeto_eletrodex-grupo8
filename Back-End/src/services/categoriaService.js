const CategoriaRepository = require('../repositories/categoriaRepository');

class CategoriaService {
    async listarCategorias() {
        const categorias = await CategoriaRepository.findAll();
        return {
            sucesso: true,
            mensagem: "Categorias listadas com sucesso",
            dados: categorias
        };
    }

    async buscarCategoriaPorId(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }

        const categoria = await CategoriaRepository.findById(id);
        if (!categoria) {
            throw { status: 404, mensagem: "Categoria não encontrada" };
        }

        return {
            sucesso: true,
            mensagem: "Categoria encontrada com sucesso",
            dados: categoria
        };
    }

    async cadastrarCategoria(dados) {
        const { id_produto, nome_categoria, descricao } = dados || {};

        if (!id_produto || !nome_categoria || !descricao) {
            throw { status: 400, mensagem: "Os campos id_produto, nome_categoria e descricao são obrigatórios" };
        }

        const id = await CategoriaRepository.create(dados);
        return {
            sucesso: true,
            mensagem: "Categoria cadastrada com sucesso",
            id
        };
    }

    async atualizarCategoria(id, dadosAtualizacao) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }

        const categoriaAntiga = await CategoriaRepository.findById(id);
        if (!categoriaAntiga) {
            throw { status: 404, mensagem: "Categoria não encontrada para atualização" };
        }

        const { id_produto, nome_categoria, descricao } = dadosAtualizacao || {};
        if (!id_produto || !nome_categoria || !descricao) {
            throw { status: 400, mensagem: "Todos os campos obrigatórios devem ser fornecidos para atualização" };
        }

        await CategoriaRepository.update(id, dadosAtualizacao);

        return {
            sucesso: true,
            mensagem: "Categoria atualizada com sucesso"
        };
    }

    async deletarCategoria(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }

        const categoria = await CategoriaRepository.findById(id);
        if (!categoria) {
            throw { status: 404, mensagem: "Categoria não encontrada" };
        }

        await CategoriaRepository.delete(id);

        return {
            sucesso: true,
            mensagem: "Categoria apagada com sucesso"
        };
    }
}

module.exports = new CategoriaService();