const db = require('../config/database'); // Ajuste o caminho do seu banco de dados

class SaidaRepository {
    async findAll(idFuncionario = null) {
        const query = idFuncionario
            ? 'SELECT * FROM saida WHERE id_funcionario = ? ORDER BY id_saida DESC'
            : 'SELECT * FROM saida ORDER BY id_saida DESC';
        const [rows] = idFuncionario
            ? await db.query(query, [idFuncionario])
            : await db.query(query);
        return rows;
    }

    async findById(id, idFuncionario = null) {
        const query = idFuncionario
            ? 'SELECT * FROM saida WHERE id_saida = ? AND id_funcionario = ?'
            : 'SELECT * FROM saida WHERE id_saida = ?';
        const [rows] = idFuncionario
            ? await db.query(query, [id, idFuncionario])
            : await db.query(query, [id]);
        return rows[0];
    }

    async create(dados) {
        const { id_entrada, data_saida, nome_produto, id_produto, setor_produto, id_lote, id_funcionario } = dados;
        const query = `
            INSERT INTO saida (id_entrada, data_saida, nome_produto, id_produto, setor_produto, id_lote, id_funcionario)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [
            id_entrada,
            data_saida,
            nome_produto,
            id_produto,
            setor_produto,
            id_lote,
            id_funcionario,
        ]);
        return result.insertId;
    }

    async update(id, dados) {
        const { id_entrada, data_saida, nome_produto, id_produto, setor_produto, id_lote } = dados;
        const query = `
            UPDATE saida
            SET id_entrada = ?, data_saida = ?, nome_produto = ?, id_produto = ?, setor_produto = ?, id_lote = ?
            WHERE id_saida = ?
        `;
        await db.query(query, [
            id_entrada,
            data_saida,
            nome_produto,
            id_produto,
            setor_produto,
            id_lote,
            id
        ]);
    }

    async delete(id) {
        const query = 'DELETE FROM saida WHERE id_saida = ?';
        await db.query(query, [id]);
    }
}

module.exports = new SaidaRepository();