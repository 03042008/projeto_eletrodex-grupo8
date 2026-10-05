const SaidaService = require('../services/saidaService');

module.exports = {
  async listar(req, res) {
    try {
      const resultado = await SaidaService.listarSaidas(req.usuario);
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao buscar saídas.' });
    }
  },

  async buscarPorId(req, res) {
    const { id } = req.params;
    try {
      const resultado = await SaidaService.buscarSaidaPorId(id, req.usuario);
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(error.status || 404).json({ erro: error.mensagem || 'Erro ao buscar registro.' });
    }
  },

  async criar(req, res) {
    try {
      const resultado = await SaidaService.cadastrarSaida(req.body, req.usuario);
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(error.status || 500).json({ erro: error.mensagem || 'Erro ao registrar saída.' });
    }
  },

  async atualizar(req, res) {
    const { id } = req.params;
    try {
      const resultado = await SaidaService.atualizarSaida(id, req.body);
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(error.status || 500).json({ erro: error.mensagem || 'Erro ao atualizar saída.' });
    }
  },

  async deletar(req, res) {
    const { id } = req.params;
    try {
      const resultado = await SaidaService.deletarSaida(id);
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(error.status || 500).json({ erro: error.mensagem || 'Erro ao remover saída.' });
    }
  }
};