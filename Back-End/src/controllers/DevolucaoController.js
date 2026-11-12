const fs = require('fs').promises;
const path = require('path');
const DevolucaoService = require('../services/DevolucaoService');

class DevolucaoController {
  async listar(req, res) {
    try {
      return res.status(200).json(await DevolucaoService.listar());
    } catch (error) {
      return res.status(500).json({ erro: 'Não foi possível carregar as devoluções.' });
    }
  }

  async registrar(req, res) {
    if (!req.file) return res.status(400).json({ erro: 'A foto do produto é obrigatória.' });
    try {
      const foto = path.relative(path.join(__dirname, '../../'), req.file.path).replace(/\\/g, '/');
      const result = await DevolucaoService.registrar({
        ...req.body,
        id_funcionario: req.usuario.id_funcionario,
        foto,
      });
      return res.status(201).json(result);
    } catch (error) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(error.status || 500).json({ erro: error.mensagem || 'Não foi possível registrar a devolução.' });
    }
  }

  async atualizarStatus(req, res) {
    try {
      const result = await DevolucaoService.atualizarStatus(
        req.params.id,
        req.body?.status,
        req.usuario.id_funcionario
      );
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.status || 500).json({ erro: error.mensagem || 'Não foi possível atualizar a devolução.' });
    }
  }
}

module.exports = new DevolucaoController();