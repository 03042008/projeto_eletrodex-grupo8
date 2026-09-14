const db = require('../config/database');

class EntradaRepository {
    async findAll() {
        const query = 'SELECT * FROM Entrada';
        const [rows] = await db.query(query);
        return rows;
    }

    async findById(id) {
        const query = 'SELECT * FROM Entrada WHERE ID_entrada = ?';
        const [rows] = await db.query(query, [id]);
        return rows[0];
    }

    async create(dados) {
        const { Data_entrada, Nome_produto, ID_produto, Setor_produto, ID_lote } = dados;
        const query = `
            INSERT INTO Entrada (Data_entrada, Nome_produto, ID_produto, Setor_produto, ID_lote)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [
            Data_entrada,
            Nome_produto,
            ID_produto,
            Setor_produto,
            ID_lote
        ]);
        return result.insertId;
    }

    async update(id, dados) {
        const { Data_entrada, Nome_produto, ID_produto, Setor_produto, ID_lote } = dados;
        const query = `
            UPDATE Entrada 
            SET Data_entrada = ?, Nome_produto = ?, ID_produto = ?, Setor_produto = ?, ID_lote = ?
            WHERE ID_entrada = ?
        `;
        await db.query(query, [
            Data_entrada,
            Nome_produto,
            ID_produto,
            Setor_produto,
            ID_lote,
            id
        ]);
    }

    async delete(id) {
        const query = 'DELETE FROM Entrada WHERE ID_entrada = ?';
        await db.query(query, [id]);
    }
}

module.exports = new EntradaRepository();