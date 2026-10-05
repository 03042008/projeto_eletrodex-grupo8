const express = require('express');
const router = express.Router();
const saidaController = require('../controllers/saidaController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);
router.get('/', authorize('Administrador', 'Gerente', 'Estoquista', 'Vendedor'), saidaController.listar);
router.get('/:id', authorize('Administrador', 'Gerente', 'Estoquista', 'Vendedor'), saidaController.buscarPorId);
router.post('/', authorize('Administrador', 'Gerente', 'Estoquista', 'Vendedor'), saidaController.criar);
router.put('/:id', authorize('Administrador', 'Gerente'), saidaController.atualizar);
router.delete('/:id', authorize('Administrador', 'Gerente'), saidaController.deletar);

module.exports = router;
