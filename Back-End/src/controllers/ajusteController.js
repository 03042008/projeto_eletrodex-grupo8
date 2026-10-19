const AjusteService = require('../services/ajusteService');

function responderErro(res, erro) {
    const status = erro.status || 500;
    return res.status(status).json({ erro: erro.mensagem || erro.message || 'Erro interno do servidor' });
}

class AjusteController {
    async listar(req, res) {
        try { return res.status(200).json(await AjusteService.listarAjustes()); }
        catch (erro) { return responderErro(res, erro); }
    }

    async buscarPorId(req, res) {
        try { return res.status(200).json(await AjusteService.buscarAjustePorId(req.params.id)); }
        catch (erro) { return responderErro(res, erro); }
    }

    async cadastrar(req, res) {
        try { return res.status(201).json(await AjusteService.cadastrarAjuste(req.body)); }
        catch (erro) { return responderErro(res, erro); }
    }

    async atualizar(req, res) {
        try { return res.status(200).json(await AjusteService.atualizarAjuste(req.params.id, req.body)); }
        catch (erro) { return responderErro(res, erro); }
    }

    async deletar(req, res) {
        try { return res.status(200).json(await AjusteService.deletarAjuste(req.params.id)); }
        catch (erro) { return responderErro(res, erro); }
    }
}

module.exports = new AjusteController();