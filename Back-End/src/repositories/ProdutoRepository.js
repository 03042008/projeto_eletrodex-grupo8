const pool = require('../config/database');

const ALLOWED_COLUMNS = ['nome', 'descricao'];

class ProdutoRepository {
    async findAll() {
        const [rows] = await pool.query(`
            SELECT p.*, COALESCE((
                SELECT SUM(l.quantidade) FROM lote l WHERE l.id_produto = p.id_produto
            ), 0) AS quantidade_estoque
            FROM produto p
            ORDER BY p.id_produto DESC
        `);
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query(`
            SELECT p.*, COALESCE((
                SELECT SUM(l.quantidade) FROM lote l WHERE l.id_produto = p.id_produto
            ), 0) AS quantidade_estoque
            FROM produto p
            WHERE p.id_produto = ?
        `, [id]);
        if (rows.length === 0) return null;
        return rows[0];
    }

    async create(produtoData) {
        const camposValidos = {};

        for (const coluna of ALLOWED_COLUMNS) {
            if (produtoData[coluna] !== undefined && produtoData[coluna] !== null) {
                camposValidos[coluna] = produtoData[coluna];
            }
        }

        if (!camposValidos.nome || !camposValidos.descricao) {
            throw { status: 400, mensagem: 'Nome e descrição são obrigatórios' };
        }

        const [result] = await pool.query(
            'INSERT INTO produto (nome, descricao) VALUES (?, ?)',
            [camposValidos.nome, camposValidos.descricao]
        );
        return result.insertId;
    }

    async update(id, produtoData) {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(produtoData)) {
            if (ALLOWED_COLUMNS.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (fields.length === 0) return null;

        values.push(id);
        const query = `UPDATE produto SET ${fields.join(', ')} WHERE id_produto = ?`;
        const [result] = await pool.query(query, values);
        return result.affectedRows;
    }

    async delete(id) {
        const [result] = await pool.query('DELETE FROM produto WHERE id_produto = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = new ProdutoRepository();