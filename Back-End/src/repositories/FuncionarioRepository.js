const pool = require("../config/database");

class FuncionarioRepository {
  async findAll() {
    const [rows] = await pool.query(
      "SELECT id_funcionario, id_nivel, nome, email, cpf FROM funcionario ORDER BY id_funcionario DESC"
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query(
      "SELECT id_funcionario, id_nivel, nome, email, cpf FROM funcionario WHERE id_funcionario = ?",
      [id]
    );
    return rows[0] || null;
  }

  async findByEmailOrCpf(email, cpf) {
    const [rows] = await pool.query(
      "SELECT id_funcionario, email, cpf FROM funcionario WHERE email = ? OR cpf = ? LIMIT 1",
      [email, cpf]
    );
    return rows[0] || null;
  }

  async findByEmailForLogin(email) {
    const [rows] = await pool.query(
      "SELECT f.id_funcionario, f.id_nivel, f.nome, f.email, f.senha, n.descricao AS nivel FROM funcionario f JOIN nivel n ON n.id_nivel = f.id_nivel WHERE f.email = ? LIMIT 1",
      [email]
    );
    return rows[0] || null;
  }

  async findForPasswordReset(email) {
    const [rows] = await pool.query(
      "SELECT id_funcionario, email FROM funcionario WHERE email = ? LIMIT 1",
      [email]
    );
    return rows[0] || null;
  }

  async updatePasswordById(id, senhaHash) {
    const [result] = await pool.query(
      "UPDATE funcionario SET senha = ? WHERE id_funcionario = ?",
      [senhaHash, id]
    );
    return result.affectedRows;
  }

  async findNivelIdByDescricao(descricao) {
    const [rows] = await pool.query(
      "SELECT id_nivel FROM nivel WHERE descricao = ? LIMIT 1",
      [descricao]
    );
    return rows[0]?.id_nivel || null;
  }

  async create(funcionarioData) {
    const { id_nivel, nome, email, senha, cpf } = funcionarioData;

    const [result] = await pool.query(
      "INSERT INTO funcionario (id_nivel, nome, email, senha, cpf) VALUES (?, ?, ?, ?, ?)",
      [id_nivel, nome, email, senha, cpf]
    );

    return result.insertId;
  }

  async update(id, funcionarioData) {
    const entries = Object.entries(funcionarioData);
    if (entries.length === 0) return null;

    const fields = entries.map(([key]) => `${key} = ?`);
    const values = entries.map(([, value]) => value);
    values.push(id);

    const query = `UPDATE funcionario SET ${fields.join(", ")} WHERE id_funcionario = ?`;
    const [result] = await pool.query(query, values);
    return result.affectedRows;
  }

  async delete(id) {
    const [result] = await pool.query("DELETE FROM funcionario WHERE id_funcionario = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = new FuncionarioRepository();
