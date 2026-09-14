const db = require('../config/database'); // Ajuste o caminho do seu banco de dados

class SaidaRepository {
    async findAll() {
        const query = 'SELECT * FROM Saida';
        const [rows] = await db.query(query);
        return rows;
    }

    async findById(id) {
        const query = 'SELECT * FROM Saida WHERE ID_saida = ?';
        const [rows] = await db.query(query, [id]);
        return rows[0];
    }

    async create(dados) {
        const { ID_entrada, Data_saida, Nome_produto, ID_produto, Setor_produto, ID_lote } = dados;
        const query = `
            INSERT INTO Saida (ID_entrada, Data_saida, Nome_produto, ID_produto, Setor_produto, ID_lote)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [
            ID_entrada,
            Data_saida,
            Nome_produto,
            ID_produto,
            Setor_produto,
            ID_lote
        ]);
        return result.insertId;
    }

    async update(id, dados) {
        const { ID_entrada, Data_saida, Nome_produto, ID_produto, Setor_produto, ID_lote } = dados;
        const query = `
            UPDATE Saida 
            SET ID_entrada = ?, Data_saida = ?, Nome_produto = ?, ID_produto = ?, Setor_produto = ?, ID_lote = ?
            WHERE ID_saida = ?
        `;
        await db.query(query, [
            ID_entrada,
            Data_saida,
            Nome_produto,
            ID_produto,
            Setor_produto,
            ID_lote,
            id
        ]);
    }

    async delete(id) {
        const query = 'DELETE FROM Saida WHERE ID_saida = ?';
        await db.query(query, [id]);
    }
}

module.exports = new SaidaRepository();