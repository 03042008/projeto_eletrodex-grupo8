const express = require('express');
const router = express.Router();
const AjusteController = require('../controllers/ajusteController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);
router.get('/', authorize('Administrador', 'Gerente', 'Estoquista'), AjusteController.listar);
router.get('/:id', authorize('Administrador', 'Gerente', 'Estoquista'), AjusteController.buscarPorId);
router.post('/', authorize('Administrador', 'Estoquista'), AjusteController.cadastrar);
router.put('/:id', authorize('Administrador', 'Estoquista'), AjusteController.atualizar);
router.delete('/:id', authorize('Administrador', 'Estoquista'), AjusteController.deletar);

module.exports = router;