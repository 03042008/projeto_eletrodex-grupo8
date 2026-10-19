const express = require('express');
const router = express.Router();
const AjusteController = require('../controllers/ajusteController');

router.get('/', AjusteController.listar);
router.get('/:id', AjusteController.buscarPorId);
router.post('/', AjusteController.cadastrar);
router.put('/:id', AjusteController.atualizar);
router.delete('/:id', AjusteController.deletar);

module.exports = router;