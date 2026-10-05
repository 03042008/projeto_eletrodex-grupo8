const express = require('express');
const router = express.Router();
const entradaController = require('../controllers/entradaController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);
router.get('/', authorize('Administrador', 'Gerente', 'Estoquista'), entradaController.listar);
router.get('/:id', authorize('Administrador', 'Gerente', 'Estoquista'), entradaController.buscarPorId);
router.post('/', authorize('Administrador', 'Estoquista'), entradaController.criar);
router.put('/:id', authorize('Administrador', 'Estoquista'), entradaController.atualizar);
router.delete('/:id', authorize('Administrador', 'Estoquista'), entradaController.deletar);

module.exports = router;
