const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');
const upload = require('../config/multer');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);
router.get('/', authorize('Administrador', 'Gerente', 'Estoquista', 'Vendedor'), ProdutoController.listar);
router.get('/:id', authorize('Administrador', 'Gerente', 'Estoquista', 'Vendedor'), ProdutoController.buscarPorId);
router.post('/', authorize('Administrador', 'Estoquista'), upload.single('imagem'), ProdutoController.cadastrarComImagem);
router.put('/:id', authorize('Administrador', 'Estoquista'), upload.single('imagem'), ProdutoController.atualizar);
router.delete('/:id', authorize('Administrador', 'Estoquista'), ProdutoController.deletar);

module.exports = router;