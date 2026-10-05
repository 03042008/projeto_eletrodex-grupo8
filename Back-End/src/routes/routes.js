const express = require('express');
const router = express.Router();
const entradaController = require('../controllers/entradaController');
const saidaController = require('../controllers/saidaController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);

// Rotas de Entrada
router.get('/entrada', authorize('Administrador', 'Gerente', 'Estoquista'), entradaController.listar);
router.get('/entrada/:id', authorize('Administrador', 'Gerente', 'Estoquista'), entradaController.buscarPorId);
router.post('/entrada', authorize('Administrador', 'Gerente', 'Estoquista'), entradaController.criar);
router.put('/entrada/:id', authorize('Administrador', 'Gerente'), entradaController.atualizar);
router.delete('/entrada/:id', authorize('Administrador', 'Gerente'), entradaController.deletar);

// Rotas de Saída
router.get('/saida', authorize('Administrador', 'Gerente', 'Estoquista', 'Vendedor'), saidaController.listar);
router.get('/saida/:id', authorize('Administrador', 'Gerente', 'Estoquista', 'Vendedor'), saidaController.buscarPorId);
router.post('/saida', authorize('Administrador', 'Gerente', 'Estoquista', 'Vendedor'), saidaController.criar);
router.put('/saida/:id', authorize('Administrador', 'Gerente'), saidaController.atualizar);
router.delete('/saida/:id', authorize('Administrador', 'Gerente'), saidaController.deletar);

module.exports = router;