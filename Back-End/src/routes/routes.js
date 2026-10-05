const express = require('express');
const router = express.Router();
const entradaController = require('../controllers/entradaController');
const saidaController = require('../controllers/saidaController');

// Rotas de Entrada
router.get('/entrada', entradaController.listar);
router.get('/entrada/:id', entradaController.buscarPorId);
router.post('/entrada', entradaController.criar);
router.put('/entrada/:id', entradaController.atualizar);
router.delete('/entrada/:id', entradaController.deletar);

// Rotas de Saída
router.get('/saida', saidaController.listar);
router.get('/saida/:id', saidaController.buscarPorId);
router.post('/saida', saidaController.criar);
router.put('/saida/:id', saidaController.atualizar);
router.delete('/saida/:id', saidaController.deletar);

module.exports = router;