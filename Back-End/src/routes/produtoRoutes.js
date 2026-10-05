const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');
const upload = require('../config/multer');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);
router.get('/', authorize('Administrador', 'Gerente', 'Estoquista', 'Vendedor', 'Funcionário'), ProdutoController.listar);
router.get('/:id', authorize('Administrador', 'Gerente', 'Estoquista', 'Vendedor', 'Funcionário'), ProdutoController.buscarPorId);
router.post('/', authorize('Administrador', 'Gerente'), upload.single('imagem'), ProdutoController.cadastrarComImagem);
router.put('/:id', authorize('Administrador', 'Gerente'), upload.single('imagem'), ProdutoController.atualizar);
router.delete('/:id', authorize('Administrador', 'Gerente'), ProdutoController.deletar);

module.exports = router;