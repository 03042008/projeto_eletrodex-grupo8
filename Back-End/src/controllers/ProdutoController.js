const ProdutoService = require('../services/ProdutoService');
const path = require('path');
const fs = require('fs').promises;

class ProdutoController {
    async listar(req, res) {
        try {
            const resultado = await ProdutoService.listarProdutos();
            res.json(resultado);
        } catch (erro) {
            const status = erro?.status || 500;
            const mensagem = erro?.mensagem || erro?.message || "Erro interno do servidor";
            res.status(status).json({
                sucesso: false,
                mensagem,
                erro: erro?.stack || erro
            });
        }
    }

    async buscarPorId(req, res) {
        try {
            const resultado = await ProdutoService.buscarProdutoPorId(req.params.id);
            res.json(resultado);
        } catch (erro) {
            const status = erro?.status || 500;
            const mensagem = erro?.mensagem || erro?.message || "Erro interno do servidor";
            res.status(status).json({
                sucesso: false,
                mensagem,
                erro: erro?.stack || erro
            });
        }
    }

    async cadastrar(req, res) {
        try {
            const resultado = await ProdutoService.cadastrarProduto(req.body);
            res.status(201).json(resultado);
        } catch (erro) {
            const status = erro?.status || 500;
            const mensagem = erro?.mensagem || erro?.message || "Erro interno do servidor";
            res.status(status).json({
                sucesso: false,
                mensagem,
                erro: erro?.stack || erro
            });
        }
    }
    
    async uploadImagem(req, res) {
        const files = req.files && req.files.length ? req.files : (req.file ? [req.file] : []);

        if (!files || files.length === 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Arquivo inválido'
            });
        }

        const arquivos = files.map(f => ({
            fieldname: f.fieldname,
            filename: f.filename,
            path: f.path
        }));

        return res.status(200).json({
            sucesso: true,
            mensagem: arquivos.length > 1 ? 'Arquivos enviados com sucesso' : 'Arquivo enviado com sucesso',
            arquivos
        });
    }

    async deletar(req, res) {
        try {
            const resultado = await ProdutoService.deletarProduto(req.params.id);
            res.json(resultado);
        } catch (erro) {
            const status = erro?.status || 500;
            const mensagem = erro?.mensagem || erro?.message || "Erro interno do servidor";
            res.status(status).json({
                sucesso: false,
                mensagem,
                erro: erro?.stack || erro
            });
        }
    }

    async cadastrarComImagem(req, res) {
        let caminhoImagem = null;
        try {
            const {
                nome,
                descricao,
                preco,
                categoria,
                setor,
                tamanho,
                quantidade,
                modelo,
                localizacao,
                estado_produto,
                proxima_revisao
            } = req.body;
            const file = req.file;

            if (!nome || preco === undefined || preco === '') {
                if (file) {
                    await fs.unlink(file.path).catch(() => {});
                }
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Nome e preço são obrigatórios"
                });
            }

            // Preparar caminho relativo da imagem
            if (file) {
                const relativePath = path.relative(path.join(__dirname, '../../'), file.path).replace(/\\/g, '/');
                caminhoImagem = relativePath.startsWith('uploads/')
                    ? relativePath
                    : `uploads/${relativePath}`;
            }

            const novoProduto = {
                nome,
                descricao: descricao || modelo || nome,
                preco: parseFloat(preco),
                categoria: categoria || null,
                imagem: caminhoImagem,
                setor,
                tamanho,
                quantidade: quantidade === undefined ? 0 : Number(quantidade),
                modelo,
                localizacao,
                estado_produto,
                proxima_revisao: proxima_revisao || null
            };

            const resultado = await ProdutoService.cadastrarProduto(novoProduto);
            res.status(201).json(resultado);
        } catch (erro) {
            if (req.file) {
                await fs.unlink(req.file.path).catch(() => {});
            }
            console.error('Erro ao cadastrar produto:', erro);
            const status = erro?.status || 500;
            const mensagem = erro?.mensagem || erro?.message || "Erro ao cadastrar produto";
            res.status(status).json({
                sucesso: false,
                mensagem,
                erro: erro?.stack || erro
            });
        }
    }

    async atualizar(req, res) {
        try {
            const id = req.params.id;
            const file = req.file;
            const dadosAtualizacao = { ...req.body };

            // Se uma nova imagem foi enviada no PUT, processa o caminho dela
            if (file) {
                const relativePath = path.relative(path.join(__dirname, '../../'), file.path).replace(/\\/g, '/');
                dadosAtualizacao.imagem = relativePath.startsWith('uploads/')
                    ? relativePath
                    : `uploads/${relativePath}`;
            }

            if (dadosAtualizacao.preco !== undefined && dadosAtualizacao.preco !== '') {
                dadosAtualizacao.preco = parseFloat(dadosAtualizacao.preco);
            }
            if (dadosAtualizacao.quantidade !== undefined) {
                dadosAtualizacao.quantidade = Number(dadosAtualizacao.quantidade);
            }
            if (dadosAtualizacao.proxima_revisao === '') {
                dadosAtualizacao.proxima_revisao = null;
            }

            const resultado = await ProdutoService.atualizarProduto(id, dadosAtualizacao);
            res.json(resultado);
        } catch (erro) {
            // Em caso de erro na atualização, remove o arquivo que acabou de ser feito upload
            if (req.file) {
                await fs.unlink(req.file.path).catch(() => {});
            }
            const status = erro?.status || 500;
            const mensagem = erro?.mensagem || erro?.message || "Erro interno do servidor";
            res.status(status).json({
                sucesso: false,
                mensagem,
                erro: erro?.stack || erro
            });
        }
    }
}
        
module.exports = new ProdutoController();