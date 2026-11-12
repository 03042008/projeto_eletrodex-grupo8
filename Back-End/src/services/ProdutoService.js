const ProdutoRepository = require('../repositories/ProdutoRepository');
const fs = require('fs').promises;
const path = require('path');

function validDate(value) {
    if (value === null || value === undefined || value === '') return true;
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

class ProdutoService {
    async listarProdutos() {
        const produtos = await ProdutoRepository.findAll();
        return {
            sucesso: true,
            mensagem: "Produtos listados com sucesso",
            dados: produtos
        };
    }

    async buscarProdutoPorId(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }

        const produto = await ProdutoRepository.findById(id);
        if (!produto) {
            throw { status: 404, mensagem: "Produto não encontrado" };
        }

        return {
            sucesso: true,
            mensagem: "Produto encontrado com sucesso",
            dados: produto
        };
    }

    async cadastrarProduto(dados) {
        if (!dados || !String(dados.nome || '').trim()) {
            throw { status: 400, mensagem: "O nome do produto é obrigatório." };
        }

        const produto = { ...dados };
        produto.nome = String(produto.nome).trim();
        produto.modelo = String(produto.modelo || '').trim() || null;
        produto.descricao = String(produto.descricao || produto.modelo || produto.nome).trim();
        produto.setor = String(produto.setor || 'Estoque').trim();
        produto.tamanho = String(produto.tamanho || '').trim() || null;
        produto.localizacao = String(produto.localizacao || produto.setor || 'Estoque').trim();
        produto.estado_produto = String(produto.estado_produto || 'Novo').trim();
        produto.preco = produto.preco === undefined || produto.preco === '' ? 0 : Number(produto.preco);
        produto.quantidade = produto.quantidade === undefined || produto.quantidade === '' ? 0 : Number(produto.quantidade);

        if (!produto.setor || !produto.localizacao || !produto.estado_produto) {
            throw { status: 400, mensagem: "Setor, localização e conservação são obrigatórios." };
        }
        if (produto.nome.length > 100 || produto.descricao.length > 100 ||
            produto.setor.length > 100 || produto.localizacao.length > 150 ||
            produto.estado_produto.length > 100 ||
            (produto.modelo && produto.modelo.length > 100) ||
            (produto.tamanho && produto.tamanho.length > 100)) {
            throw { status: 400, mensagem: "Um ou mais campos de texto excedem o limite permitido." };
        }
        if (!Number.isFinite(produto.preco) || produto.preco < 0 || produto.preco > 99999999.99) {
            throw { status: 400, mensagem: "Informe um preço válido." };
        }
        if (!Number.isInteger(produto.quantidade) || produto.quantidade < 0 || produto.quantidade > 2147483647) {
            throw { status: 400, mensagem: "A quantidade deve ser um número inteiro igual ou maior que zero." };
        }
        if (!validDate(produto.proxima_revisao)) {
            throw { status: 400, mensagem: "Informe uma data válida para a próxima revisão." };
        }

        const id = await ProdutoRepository.create(produto);
        return {
            sucesso: true,
            mensagem: "Produto cadastrado com sucesso",
            id
        };
    }

    async atualizarProduto(id, dadosAtualizacao) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }

        const produtoAntigo = await ProdutoRepository.findById(id);
        if (!produtoAntigo) {
            throw { status: 404, mensagem: "Produto não encontrado para atualização" };
        }

        const atualizacao = { ...dadosAtualizacao };
        if (atualizacao.nome !== undefined) {
            atualizacao.nome = String(atualizacao.nome).trim();
            if (!atualizacao.nome) throw { status: 400, mensagem: "O nome do produto não pode ser vazio." };
        }
        if (atualizacao.preco !== undefined) {
            atualizacao.preco = Number(atualizacao.preco);
            if (!Number.isFinite(atualizacao.preco) || atualizacao.preco < 0 || atualizacao.preco > 99999999.99) {
                throw { status: 400, mensagem: "Informe um preço válido." };
            }
        }
        if (atualizacao.quantidade !== undefined) {
            atualizacao.quantidade = Number(atualizacao.quantidade);
            if (!Number.isInteger(atualizacao.quantidade) || atualizacao.quantidade < 0 || atualizacao.quantidade > 2147483647) {
                throw { status: 400, mensagem: "A quantidade deve ser um número inteiro igual ou maior que zero." };
            }
        }
        for (const campo of ['setor', 'localizacao', 'estado_produto']) {
            if (atualizacao[campo] !== undefined) {
                atualizacao[campo] = String(atualizacao[campo]).trim();
                if (!atualizacao[campo]) throw { status: 400, mensagem: `${campo} não pode ser vazio.` };
            }
        }
        for (const campo of ['descricao', 'modelo', 'tamanho']) {
            if (atualizacao[campo] !== undefined) {
                atualizacao[campo] = String(atualizacao[campo]).trim() || null;
            }
        }
        const limitesTexto = {
            nome: 100,
            descricao: 100,
            setor: 100,
            localizacao: 150,
            estado_produto: 100,
            modelo: 100,
            tamanho: 100,
        };
        for (const [campo, limite] of Object.entries(limitesTexto)) {
            if (atualizacao[campo] !== undefined && atualizacao[campo] !== null &&
                atualizacao[campo].length > limite) {
                throw { status: 400, mensagem: `O campo ${campo} deve ter até ${limite} caracteres.` };
            }
        }
        if (atualizacao.proxima_revisao !== undefined && !validDate(atualizacao.proxima_revisao)) {
            throw { status: 400, mensagem: "Informe uma data válida para a próxima revisão." };
        }

        if (dadosAtualizacao.imagem && produtoAntigo.imagem) {
            const caminhoArquivoAntigo = path.join(__dirname, '../../', produtoAntigo.imagem);
            await fs.unlink(caminhoArquivoAntigo).catch(() => {
                console.log("Aviso: Arquivo antigo não encontrado no disco para exclusão.");
            });
        }

        await ProdutoRepository.update(id, atualizacao);

        return {
            sucesso: true,
            mensagem: "Produto atualizado com sucesso"
        };
    }

    async deletarProduto(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }

        const produto = await ProdutoRepository.findById(id);
        if (!produto) {
            throw { status: 404, mensagem: "Produto não encontrado" };
        }

        if (Number(produto.quantidade) > 0) {
            throw { status: 409, mensagem: "Zere o estoque antes de excluir este produto." };
        }

        if (await ProdutoRepository.hasReferences(id)) {
            throw {
                status: 409,
                mensagem: "Este produto possui lotes ou movimentações registradas e não pode ser excluído.",
            };
        }

        if (produto.imagem) {
            const caminhoArquivo = path.join(__dirname, '../../', produto.imagem);
            await fs.unlink(caminhoArquivo).catch(() => {});
        }

        await ProdutoRepository.delete(id);

        return {
            sucesso: true,
            mensagem: "Produto apagado com sucesso"
        };
    }
}

module.exports = new ProdutoService();