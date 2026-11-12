const pool = require('../config/database');

class DevolucaoRepository {
  async listar() {
    const [rows] = await pool.query(`
      SELECT d.*, p.nome AS produto_nome, l.nota_fiscal, l.localizacao AS lote_localizacao,
        solicitante.nome AS solicitante_nome, revisor.nome AS revisor_nome
      FROM devolucao d
      JOIN produto p ON p.id_produto = d.id_produto
      JOIN lote l ON l.id_lote = d.id_lote
      JOIN funcionario solicitante ON solicitante.id_funcionario = d.id_funcionario
      LEFT JOIN funcionario revisor ON revisor.id_funcionario = d.revisado_por
      ORDER BY d.data_devolucao DESC, d.id_devolucao DESC
    `);
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.query('SELECT * FROM devolucao WHERE id_devolucao = ?', [id]);
    return rows[0] || null;
  }

  async buscarLote(idLote) {
    const [rows] = await pool.query('SELECT id_lote, id_produto FROM lote WHERE id_lote = ?', [idLote]);
    return rows[0] || null;
  }

  async criar(devolucao) {
    const [result] = await pool.query(`
      INSERT INTO devolucao (id_produto, id_lote, id_funcionario, quantidade, motivo, foto)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      devolucao.id_produto,
      devolucao.id_lote,
      devolucao.id_funcionario,
      devolucao.quantidade,
      devolucao.motivo,
      devolucao.foto,
    ]);
    return result.insertId;
  }

  async atualizarStatus(id, status, revisorId) {
    const connection = await pool.getConnection();
    let transactionStarted = false;
    try {
      await connection.beginTransaction();
      transactionStarted = true;
      const [rows] = await connection.query(
        'SELECT id_lote, quantidade, status FROM devolucao WHERE id_devolucao = ? FOR UPDATE',
        [id]
      );
      const devolucao = rows[0];
      if (!devolucao) throw { status: 404, mensagem: 'Devolução não encontrada.' };
      if (!['pendente', 'em_analise'].includes(devolucao.status)) {
        throw { status: 409, mensagem: 'Esta devolução já foi concluída.' };
      }
      if (status === 'em_analise' && devolucao.status !== 'pendente') {
        throw { status: 409, mensagem: 'A devolução já está em análise.' };
      }

      if (status === 'reintegrada') {
        const [result] = await connection.query(`
          UPDATE lote SET quantidade = quantidade + ?
          WHERE id_lote = ? AND quantidade <= ?
        `, [devolucao.quantidade, devolucao.id_lote, 2147483647 - devolucao.quantidade]);
        if (result.affectedRows !== 1) {
          throw { status: 409, mensagem: 'A quantidade excede o limite permitido para este lote.' };
        }
      }

      await connection.query(`
        UPDATE devolucao
        SET status = ?, revisado_por = ?, data_revisao = CURRENT_TIMESTAMP
        WHERE id_devolucao = ?
      `, [status, revisorId, id]);
      await connection.commit();
      transactionStarted = false;
      return true;
    } catch (error) {
      if (transactionStarted) await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new DevolucaoRepository();