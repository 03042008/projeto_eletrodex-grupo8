const pool = require('../config/database');

const TIPOS_MOVIMENTACAO = new Set(['entrada', 'saida']);

function validDate(value) {
  if (!value) return true;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

module.exports = {
  async listarMovimentacoes(req, res) {
    try {
      const [rows] = await pool.query(`
        SELECT m.*, p.nome AS nome_produto, f.nome AS responsavel
        FROM movimentacao_estoque m
        JOIN produto p ON p.id_produto = m.id_produto
        JOIN funcionario f ON f.id_funcionario = m.id_funcionario
        ORDER BY m.data_movimentacao DESC, m.id_movimentacao DESC
        LIMIT 100
      `);
      return res.status(200).json({ sucesso: true, dados: rows });
    } catch (error) {
      console.error('Erro ao listar movimentações de estoque:', error);
      return res.status(500).json({ erro: 'Não foi possível carregar as movimentações.' });
    }
  },

  async registrarMovimentacao(req, res) {
    const {
      id_produto: idProduto,
      tipo,
      quantidade,
      setor,
      localizacao,
      estado_produto: estadoProduto,
      proxima_revisao: proximaRevisao,
      observacao,
    } = req.body || {};
    const quantidadeNumerica = Number(quantidade);
    const produtoId = Number(idProduto);
    const setorLimpo = typeof setor === 'string' ? setor.trim() : '';
    const localizacaoLimpa = typeof localizacao === 'string' ? localizacao.trim() : '';
    const estadoLimpo = typeof estadoProduto === 'string' ? estadoProduto.trim() : '';

    if (!Number.isInteger(produtoId) || produtoId < 1 || produtoId > 2147483647) {
      return res.status(400).json({ erro: 'Selecione um produto válido.' });
    }
    if (!TIPOS_MOVIMENTACAO.has(tipo)) {
      return res.status(400).json({ erro: 'O tipo deve ser entrada ou saída.' });
    }
    if (!Number.isInteger(quantidadeNumerica) || quantidadeNumerica < 1 || quantidadeNumerica > 2147483647) {
      return res.status(400).json({ erro: 'A quantidade deve ser um número inteiro maior que zero.' });
    }
    if (!setorLimpo || !localizacaoLimpa || !estadoLimpo ||
        setorLimpo.length > 100 || localizacaoLimpa.length > 150 || estadoLimpo.length > 100) {
      return res.status(400).json({
        erro: 'Setor, localização e conservação são obrigatórios e devem respeitar o limite de caracteres.',
      });
    }
    if (!validDate(proximaRevisao)) {
      return res.status(400).json({ erro: 'Informe uma data válida para a próxima revisão.' });
    }
    if (observacao !== undefined && observacao !== null && typeof observacao !== 'string') {
      return res.status(400).json({ erro: 'A observação deve ser um texto.' });
    }
    if (typeof observacao === 'string' && observacao.length > 500) {
      return res.status(400).json({ erro: 'A observação deve ter até 500 caracteres.' });
    }

    let connection;
    let transactionStarted = false;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      transactionStarted = true;
      const [produtos] = await connection.query(
        'SELECT id_produto, quantidade FROM produto WHERE id_produto = ? FOR UPDATE',
        [produtoId]
      );
      if (!produtos.length) {
        await connection.rollback();
        transactionStarted = false;
        return res.status(404).json({ erro: 'Produto não encontrado.' });
      }

      const quantidadeAtual = Number(produtos[0].quantidade);
      if (tipo === 'saida' && quantidadeNumerica > quantidadeAtual) {
        await connection.rollback();
        transactionStarted = false;
        return res.status(409).json({ erro: `Estoque insuficiente. Disponível: ${quantidadeAtual} unidade(s).` });
      }
      if (tipo === 'entrada' && quantidadeNumerica > 2147483647 - quantidadeAtual) {
        await connection.rollback();
        transactionStarted = false;
        return res.status(409).json({ erro: 'A quantidade excede o limite suportado pelo estoque.' });
      }

      const incremento = tipo === 'entrada' ? quantidadeNumerica : -quantidadeNumerica;
      await connection.query(`
        UPDATE produto
        SET quantidade = quantidade + ?,
            setor = ?,
            localizacao = ?,
            estado_produto = ?,
            proxima_revisao = ?
        WHERE id_produto = ?
      `, [incremento, setorLimpo, localizacaoLimpa, estadoLimpo, proximaRevisao || null, produtoId]);
      await connection.query(`
        INSERT INTO movimentacao_estoque
          (id_produto, id_funcionario, tipo, quantidade, setor, localizacao, estado_produto, proxima_revisao, observacao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        produtoId,
        req.usuario.id_funcionario,
        tipo,
        quantidadeNumerica,
        setorLimpo,
        localizacaoLimpa,
        estadoLimpo,
        proximaRevisao || null,
        typeof observacao === 'string' && observacao.trim() ? observacao.trim() : null,
      ]);
      await connection.commit();
      transactionStarted = false;
      return res.status(201).json({
        sucesso: true,
        mensagem: tipo === 'entrada' ? 'Entrada registrada com sucesso.' : 'Saída registrada com sucesso.',
      });
    } catch (error) {
      if (connection && transactionStarted) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error('Erro ao desfazer movimentação de estoque:', rollbackError);
        }
      }
      console.error('Erro ao registrar movimentação de estoque:', error);
      return res.status(500).json({ erro: 'Não foi possível registrar a movimentação.' });
    } finally {
      connection?.release();
    }
  },
};
