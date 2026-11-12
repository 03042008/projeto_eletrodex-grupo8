const express = require('express');
const router = express.Router();
const estoqueController = require('../controllers/estoqueController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);
router.use(authorize('Administrador', 'Gerente', 'Estoquista'));
router.get('/movimentacoes', estoqueController.listarMovimentacoes);
router.post('/movimentacoes', estoqueController.registrarMovimentacao);
router.put('/produtos/:id', estoqueController.atualizarDadosEstoque);
router.post('/produtos/:id/retirar', estoqueController.retirarDoEstoque);

module.exports = router;
