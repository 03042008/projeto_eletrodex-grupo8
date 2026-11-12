-- Execute uma vez após database.sql e as migrações anteriores.
ALTER TABLE produto
    ADD COLUMN setor VARCHAR(100) NOT NULL DEFAULT 'Estoque',
    ADD COLUMN imagem VARCHAR(255) NULL,
    ADD COLUMN tamanho VARCHAR(100) NULL,
    ADD COLUMN preco DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN quantidade INT NOT NULL DEFAULT 0,
    ADD COLUMN modelo VARCHAR(100) NULL,
    ADD COLUMN localizacao VARCHAR(150) NOT NULL DEFAULT 'Estoque',
    ADD COLUMN estado_produto VARCHAR(100) NOT NULL DEFAULT 'Novo',
    ADD COLUMN proxima_revisao DATE NULL;

UPDATE produto p
SET quantidade = COALESCE((
    SELECT SUM(l.quantidade)
    FROM lote l
    WHERE l.id_produto = p.id_produto
), 0);

CREATE TABLE movimentacao_estoque (
    id_movimentacao INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_funcionario INT NOT NULL,
    tipo ENUM('entrada', 'saida') NOT NULL,
    quantidade INT NOT NULL,
    setor VARCHAR(100) NOT NULL,
    localizacao VARCHAR(150) NOT NULL,
    estado_produto VARCHAR(100) NOT NULL,
    proxima_revisao DATE NULL,
    observacao VARCHAR(500) NULL,
    data_movimentacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movimentacao_estoque_produto
        FOREIGN KEY (id_produto) REFERENCES produto(id_produto),
    CONSTRAINT fk_movimentacao_estoque_funcionario
        FOREIGN KEY (id_funcionario) REFERENCES funcionario(id_funcionario)
);
