const CategoriaService = require('../services/categoriaService');

class CategoriaController {
    async listar(req, res) {
        try {
            const resultado = await CategoriaService.listarCategorias();
            return res.status(200).json(resultado);
        } catch (erro) {
            return res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro interno no servidor ao listar categorias"
            });
        }
    }

    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const resultado = await CategoriaService.buscarCategoriaPorId(id);
            return res.status(200).json(resultado);
        } catch (erro) {
            return res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro interno no servidor ao buscar categoria"
            });
        }
    }

    async cadastrar(req, res) {
        try {
            const dados = req.body;
            const resultado = await CategoriaService.cadastrarCategoria(dados);
            return res.status(201).json(resultado);
        } catch (erro) {
            return res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro interno no servidor ao cadastrar categoria"
            });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const dadosAtualizacao = req.body;
            const resultado = await CategoriaService.atualizarCategoria(id, dadosAtualizacao);
            return res.status(200).json(resultado);
        } catch (erro) {
            return res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro interno no servidor ao atualizar categoria"
            });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            const resultado = await CategoriaService.deletarCategoria(id);
            return res.status(200).json(resultado);
        } catch (erro) {
            return res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || "Erro interno no servidor ao deletar categoria"
            });
        }
    }
}

module.exports = new CategoriaController();