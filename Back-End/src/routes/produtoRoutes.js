const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');
const upload = require('../config/multer');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const uploadImagemProduto = (req, res, next) => {
  upload.single('imagem')(req, res, (error) => {
    if (!error) return next();
    const mensagem = error.code === 'LIMIT_FILE_SIZE'
      ? 'A imagem deve ter no máximo 5 MB.'
      : error.message || 'Não foi possível enviar a imagem.';
    return res.status(400).json({ sucesso: false, mensagem });
  });
};

router.use(authenticate);
router.get('/', authorize('Administrador', 'Gerente', 'Estoquista', 'Vendedor', 'Funcionário'), ProdutoController.listar);
router.get('/:id', authorize('Administrador', 'Gerente', 'Estoquista', 'Vendedor', 'Funcionário'), ProdutoController.buscarPorId);
router.post('/', authorize('Administrador', 'Gerente'), uploadImagemProduto, ProdutoController.cadastrarComImagem);
router.put('/:id', authorize('Administrador', 'Gerente'), uploadImagemProduto, ProdutoController.atualizar);
router.delete('/:id', authorize('Administrador', 'Gerente'), ProdutoController.deletar);

module.exports = router;