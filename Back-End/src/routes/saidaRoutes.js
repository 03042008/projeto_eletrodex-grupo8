const express = require('express');
const router = express.Router();
const saidaController = require('../controllers/saidaController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);
router.get('/', authorize('Administrador', 'Gerente', 'Estoquista'), saidaController.listar);
router.get('/:id', authorize('Administrador', 'Gerente', 'Estoquista'), saidaController.buscarPorId);
router.post('/', authorize('Administrador', 'Estoquista'), saidaController.criar);
router.put('/:id', authorize('Administrador', 'Estoquista'), saidaController.atualizar);
router.delete('/:id', authorize('Administrador', 'Estoquista'), saidaController.deletar);

module.exports = router;
