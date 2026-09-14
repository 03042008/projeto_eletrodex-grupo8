const db = require('../config/database');

class CategoriaRepository {
    async findAll() {
        const query = 'SELECT * FROM categoria';
        const [rows] = await db.query(query);
        return rows;
    }

    async findById(id) {
        const query = 'SELECT * FROM categoria WHERE id_categoria = ?';
        const [rows] = await db.query(query, [id]);
        return rows[0];
    }

    async create(dados) {
        const { id_produto, nome_categoria, descricao } = dados;
        const query = `
            INSERT INTO categoria (id_produto, nome_categoria, descricao)
            VALUES (?, ?, ?)
        `;
        const [result] = await db.query(query, [
            id_produto,
            nome_categoria,
            descricao
        ]);
        return result.insertId;
    }

    async update(id, dados) {
        const { id_produto, nome_categoria, descricao } = dados;
        const query = `
            UPDATE categoria 
            SET id_produto = ?, nome_categoria = ?, descricao = ?
            WHERE id_categoria = ?
        `;
        await db.query(query, [
            id_produto,
            nome_categoria,
            descricao,
            id
        ]);
    }

    async delete(id) {
        const query = 'DELETE FROM categoria WHERE id_categoria = ?';
        await db.query(query, [id]);
    }
}

module.exports = new CategoriaRepository();