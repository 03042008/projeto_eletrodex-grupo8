const pool = require('../config/database');

module.exports = {
  async listar(req, res) {
    try {
      const isSeller = req.usuario.nivel === 'Vendedor';
      const [rows] = await pool.query(
        `SELECT s.*, p.nome AS produto_nome, l.localizacao AS lote_localizacao, f.nome AS vendedor_nome
        FROM saida s
        JOIN produto p ON p.id_produto = s.id_produto
        JOIN lote l ON l.id_lote = s.id_lote
        LEFT JOIN funcionario f ON f.id_funcionario = s.id_funcionario
        ${isSeller ? 'WHERE s.id_funcionario = ?' : ''}
        ORDER BY s.data_saida DESC, s.id_saida DESC`,
        isSeller ? [req.usuario.id_funcionario] : []
      );
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar saídas.', detalhe: error.message });
    }
  },

  async buscarPorId(req, res) {
    const { id } = req.params;
    try {
      const isSeller = req.usuario.nivel === 'Vendedor';
      const [rows] = await pool.query(
        `SELECT s.*, p.nome AS produto_nome, l.localizacao AS lote_localizacao, f.nome AS vendedor_nome
        FROM saida s
        JOIN produto p ON p.id_produto = s.id_produto
        JOIN lote l ON l.id_lote = s.id_lote
        LEFT JOIN funcionario f ON f.id_funcionario = s.id_funcionario
        WHERE s.id_saida = ? ${isSeller ? 'AND s.id_funcionario = ?' : ''}`,
        isSeller ? [id, req.usuario.id_funcionario] : [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Registro de saída não encontrado.' });
      }
      return res.status(200).json(rows[0]);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar registro.', detalhe: error.message });
    }
  },

  async listarLotesDisponiveis(req, res) {
    try {
      const [rows] = await pool.query(`
        SELECT l.id_lote, l.id_produto, p.nome AS produto_nome,
          l.quantidade, l.localizacao, l.nota_fiscal
        FROM lote l
        JOIN produto p ON p.id_produto = l.id_produto
        WHERE l.quantidade > 0
        ORDER BY p.nome, l.id_lote
      `);
      return res.status(200).json({ sucesso: true, dados: rows });
    } catch (error) {
      console.error('Erro ao carregar lotes para venda:', error);
      return res.status(500).json({ erro: 'Não foi possível carregar o estoque disponível.' });
    }
  },

  async criar(req, res) {
    const idLote = Number(req.body?.id_lote);
    const quantidade = Number(req.body?.quantidade);
    const setor = typeof req.body?.setor_produto === 'string' ? req.body.setor_produto.trim() : '';
    if (!Number.isInteger(idLote) || idLote < 1) {
      return res.status(400).json({ error: 'Selecione um lote válido.' });
    }
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 2147483647) {
      return res.status(400).json({ error: 'A quantidade deve ser um inteiro maior que zero.' });
    }
    if (!setor || setor.length > 200) {
      return res.status(400).json({ error: 'Informe um setor de venda válido.' });
    }

    let connection;
    let transactionStarted = false;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      transactionStarted = true;
      const [lots] = await connection.query(`
        SELECT l.id_lote, l.id_produto, l.quantidade, p.nome AS produto_nome
        FROM lote l
        JOIN produto p ON p.id_produto = l.id_produto
        WHERE l.id_lote = ?
        FOR UPDATE
      `, [idLote]);
      const lot = lots[0];
      if (!lot) {
        await connection.rollback();
        transactionStarted = false;
        return res.status(404).json({ error: 'Lote não encontrado.' });
      }
      if (quantidade > Number(lot.quantidade)) {
        await connection.rollback();
        transactionStarted = false;
        return res.status(409).json({ error: `Estoque insuficiente. Disponível: ${lot.quantidade} unidade(s).` });
      }

      const [entries] = await connection.query(`
        SELECT id_entrada FROM entrada
        WHERE id_produto = ? AND id_lote = ?
        ORDER BY id_entrada DESC
        LIMIT 1
      `, [lot.id_produto, idLote]);
      await connection.query('UPDATE lote SET quantidade = quantidade - ? WHERE id_lote = ?', [quantidade, idLote]);
      const [result] = await connection.query(`
        INSERT INTO saida
          (id_entrada, data_saida, nome_produto, id_produto, setor_produto, id_lote, id_funcionario, quantidade)
        VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?)
      `, [
        entries[0]?.id_entrada || null,
        lot.produto_nome,
        lot.id_produto,
        setor,
        idLote,
        req.usuario.id_funcionario,
        quantidade,
      ]);
      await connection.commit();
      transactionStarted = false;
      return res.status(201).json({ sucesso: true, id_saida: result.insertId, message: 'Venda registrada e estoque atualizado.' });
    } catch (error) {
      if (connection && transactionStarted) await connection.rollback();
      console.error('Erro ao registrar saída de venda:', error);
      return res.status(500).json({ error: 'Não foi possível registrar a venda.' });
    } finally {
      connection?.release();
    }
  },

  async atualizar(req, res) {
    const { id } = req.params;
    const { id_entrada, data_saida, nome_produto, id_produto, setor_produto, id_lote } = req.body;
    try {
      const query = `
        UPDATE saida 
        SET id_entrada = ?, data_saida = ?, nome_produto = ?, id_produto = ?, setor_produto = ?, id_lote = ?
        WHERE id_saida = ?
      `;
      await pool.query(query, [id_entrada, data_saida, nome_produto, id_produto, setor_produto, id_lote, id]);
      return res.status(200).json({ message: 'Saída atualizada com sucesso.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar saída.', detalhe: error.message });
    }
  },

  async deletar(req, res) {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM saida WHERE id_saida = ?', [id]);
      return res.status(200).json({ message: 'Registro de saída removido.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover saída.', detalhe: error.message });
    }
  }
};