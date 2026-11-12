const pool = require("../config/database");

class LoteRepository {
  async findAll() {
    const [rows] = await pool.query(`
      SELECT l.*, p.nome AS produto_nome, f.nome AS responsavel_nome
      FROM lote l
      JOIN produto p ON p.id_produto = l.id_produto
      JOIN funcionario f ON f.id_funcionario = l.responsavel
      ORDER BY l.id_lote DESC
    `);
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM lote WHERE id_lote = ?", [id]);
    return rows[0] || null;
  }

  async create(loteData) {
    const { id_produto, quantidade, localizacao, data_entrada, responsavel, nota_fiscal, valor } = loteData;

    const [result] = await pool.query(
      "INSERT INTO lote (id_produto, quantidade, localizacao, data_entrada, responsavel, nota_fiscal, valor) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id_produto, quantidade, localizacao, data_entrada, responsavel, nota_fiscal, valor]
    );

    return result.insertId;
  }

  async update(id, loteData) {
    const entries = Object.entries(loteData);
    if (entries.length === 0) return null;

    const fields = entries.map(([key]) => `${key} = ?`);
    const values = entries.map(([, value]) => value);
    values.push(id);

    const query = `UPDATE lote SET ${fields.join(", ")} WHERE id_lote = ?`;
    const [result] = await pool.query(query, values);
    return result.affectedRows;
  }

  async delete(id) {
    const [result] = await pool.query("DELETE FROM lote WHERE id_lote = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = new LoteRepository();
