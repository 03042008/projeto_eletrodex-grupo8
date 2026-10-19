const pool = require('../config/database');

class AjusteRepository {
    async buscarTodos() {
        const [rows] = await pool.query(
            'SELECT * FROM ajuste ORDER BY id_ajuste DESC'
        );
        return rows;
    }

    async buscarId(id) {
        const [rows] = await pool.query(
            'SELECT * FROM ajuste WHERE id_ajuste = ?',
            [id]
        );
        return rows[0];
    }

    async produtoExiste(idProduto) {
        const [rows] = await pool.query(
            'SELECT id_produto FROM produto WHERE id_produto = ?',
            [idProduto]
        );
        return rows.length > 0;
    }

    async funcionarioExiste(idFuncionario) {
        const [rows] = await pool.query(
            'SELECT id_funcionario FROM funcionario WHERE id_funcionario = ?',
            [idFuncionario]
        );
        return rows.length > 0;
    }

    async criar(ajusteData) {
        const { id_produto, motivo, nota_fiscal, id_funcionario } = ajusteData;
        const [resultado] = await pool.query(
            `INSERT INTO ajuste (id_produto, motivo, nota_fiscal, id_funcionario)
             VALUES (?, ?, ?, ?)`,
            [id_produto, motivo, nota_fiscal, id_funcionario]
        );
        return resultado.insertId;
    }

    async atualizar(id, ajusteData) {
        const { id_produto, motivo, nota_fiscal, id_funcionario } = ajusteData;
        const [resultado] = await pool.query(
            `UPDATE ajuste
             SET id_produto = ?, motivo = ?, nota_fiscal = ?, id_funcionario = ?
             WHERE id_ajuste = ?`,
            [id_produto, motivo, nota_fiscal, id_funcionario, id]
        );
        return resultado.affectedRows;
    }

    async deletar(id) {
        const [resultado] = await pool.query(
            'DELETE FROM ajuste WHERE id_ajuste = ?',
            [id]
        );
        return resultado.affectedRows;
    }
}

module.exports = new AjusteRepository();