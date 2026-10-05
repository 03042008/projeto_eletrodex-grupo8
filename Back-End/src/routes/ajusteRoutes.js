const express = require('express');
const router = express.Router();
const AjusteController = require('../controllers/ajusteController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);
router.get('/', authorize('Administrador', 'Gerente', 'Estoquista'), AjusteController.listar);
router.get('/:id', authorize('Administrador', 'Gerente', 'Estoquista'), AjusteController.buscarPorId);
router.post('/', authorize('Administrador', 'Gerente'), AjusteController.cadastrar);
router.put('/:id', authorize('Administrador', 'Gerente'), AjusteController.atualizar);
router.delete('/:id', authorize('Administrador', 'Gerente'), AjusteController.deletar);

module.exports = router;