const pool = require("../config/database");

class MovimentacaoLoteRepository {
  async findAll() {
    const [rows] = await pool.query(
      `SELECT m.*, l.nota_fiscal, p.nome AS produto_nome, f.nome AS responsavel_nome
       FROM movimentacao_lote m
       JOIN lote l ON l.id_lote = m.id_lote
       JOIN produto p ON p.id_produto = l.id_produto
       JOIN funcionario f ON f.id_funcionario = m.responsavel
       ORDER BY m.data_movimentacao DESC, m.id_movimentacao DESC`
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query(
      "SELECT * FROM movimentacao_lote WHERE id_movimentacao = ?",
      [id]
    );
    return rows[0] || null;
  }

  async create(movimentacaoData) {
    const {
      id_lote,
      localizacao,
      data_movimentacao,
      responsavel,
      estado_produto,
      ultima_revisao,
      proxima_revisao,
      setor,
    } = movimentacaoData;

    const [result] = await pool.query(
      `INSERT INTO movimentacao_lote (
        id_lote,
        localizacao,
        data_movimentacao,
        responsavel,
        estado_produto,
        ultima_revisao,
        proxima_revisao,
        setor
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_lote,
        localizacao,
        data_movimentacao,
        responsavel,
        estado_produto,
        ultima_revisao,
        proxima_revisao ?? null,
        setor ?? null,
      ]
    );

    return result.insertId;
  }

  async update(id, movimentacaoData) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(movimentacaoData)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE movimentacao_lote SET ${fields.join(", ")} WHERE id_movimentacao = ?`;
    const [result] = await pool.query(query, values);
    return result.affectedRows;
  }

  async delete(id) {
    const [result] = await pool.query(
      "DELETE FROM movimentacao_lote WHERE id_movimentacao = ?",
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = new MovimentacaoLoteRepository();
