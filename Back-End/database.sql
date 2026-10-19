CREATE DATABASE eletrodex;
USE eletrodex;


-- ==========================
-- TABELA FUNCIONÁRIO
-- ==========================
CREATE TABLE funcionario (
    id_FUNCIONARIO INT AUTO_INCREMENT PRIMARY KEY,
    id_nivel INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(20) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,

    FOREIGN KEY (id_nivel)
        REFERENCES nivel(id_nivel)
);

-- ==========================
-- TABELA PRODUTO
-- ==========================
CREATE TABLE produto (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(100) NOT NULL
);

-- ==========================
-- TABELA NÍVEL
-- ==========================
CREATE TABLE nivel (
    id_nivel INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(100) NOT NULL
);


-- ==========================
-- TABELA LOTE
-- ==========================
CREATE TABLE lote (
    id_lote INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    localizacao VARCHAR(100) NOT NULL,
    data_entrada DATE NOT NULL,
    responsavel INT NOT NULL,
    nota_fiscal BIGINT NOT NULL UNIQUE,
    valor DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (id_produto)
        REFERENCES produto(id_produto),

    FOREIGN KEY (responsavel)
        REFERENCES funcionario(id_funcionario)
);

-- ==========================
-- TABELA MOVIMENTAÇÃO LOTE
-- ==========================
CREATE TABLE movimentacao_lote (
    id_movimentacao INT AUTO_INCREMENT PRIMARY KEY,
    id_lote INT NOT NULL,
    localizacao VARCHAR(100) NOT NULL,
    data_movimentacao DATETIME NOT NULL,
    responsavel INT NOT NULL,
    estado_produto VARCHAR(100) NOT NULL,
    ultima_revisao DATE NOT NULL,
    proxima_revisao DATE,
    setor VARCHAR(100),

    FOREIGN KEY (id_lote)
        REFERENCES lote(id_lote),

    FOREIGN KEY (responsavel)
        REFERENCES funcionario(id_funcionario)
);

-- ==========================
-- TABELA ENTRADA
-- ==========================
CREATE TABLE entrada (
    id_entrada INT AUTO_INCREMENT PRIMARY KEY,
    data_entrada DATE NOT NULL,
    nome_produto VARCHAR(200) NOT NULL,
    id_produto INT NOT NULL,
    setor_produto VARCHAR(200) NOT NULL,
    id_lote INT NOT NULL,

    FOREIGN KEY (id_produto)
        REFERENCES produto(id_produto),

    FOREIGN KEY (id_lote)
        REFERENCES lote(id_lote)
);

-- ==========================
-- TABELA SAÍDA
-- ==========================
CREATE TABLE saida (
    id_saida INT AUTO_INCREMENT PRIMARY KEY,
    id_entrada INT NOT NULL,
    data_saida DATETIME NOT NULL,
    nome_produto VARCHAR(200) NOT NULL,
    id_produto INT NOT NULL,
    setor_produto VARCHAR(200) NOT NULL,
    id_lote INT NOT NULL,

    FOREIGN KEY (id_entrada)
        REFERENCES entrada(id_entrada),

    FOREIGN KEY (id_produto)
        REFERENCES produto(id_produto),

    FOREIGN KEY (id_lote)
        REFERENCES lote(id_lote)
);

-- ==========================
-- TABELA AJUSTE
-- ==========================
CREATE TABLE ajuste (
    id_ajuste INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    motivo VARCHAR(300) NOT NULL,
    nota_fiscal INT NOT NULL,
    id_funcionario INT NOT NULL,

    FOREIGN KEY (id_produto)
        REFERENCES produto(id_produto),

    FOREIGN KEY (id_funcionario)
        REFERENCES funcionario(id_funcionario)
);

-- ==========================
-- NÍVEL
-- ==========================
INSERT INTO nivel (descricao)
VALUES('Administrador'),
('Gerente'),
('Estoquista'),
('Vendedor');

-- ==========================
-- FUNCIONÁRIO
-- ==========================
INSERT INTO funcionario
(id_nivel, nome, email, senha, cpf)
VALUES (1,'João Lucas','joao@eletrodex.com','123456','123.456.789-00'),
(2,'Leticia','lele@eletrodex.com','654321','987.654.321-00'),
(3,'Luiz','luiz@eletrodex.com','abc123','111.222.333-44');

-- ==========================
-- PRODUTO
-- ==========================
INSERT INTO produto (nome, descricao)
VALUES('Micro-ondas LG 32L','Micro-ondas espelhado 32 litros'),
('Micro-ondas Electrolux 20L','Micro-ondas branco 20 litros'),
('Micro-ondas Brastemp 30L','Micro-ondas inox 30 litros');

-- ==========================
-- LOTE
-- ==========================
INSERT INTO lote (id_produto, quantidade, localizacao, data_entrada, responsavel, nota_fiscal, valor)
VALUES
(1,50,'Corredor A - Prateleira 1','2026-08-01',3,100001,25000.00),
(2,30,'Corredor B - Prateleira 2','2026-08-02',3,100002,12000.00),
(3,20,'Corredor C - Prateleira 3','2026-08-03',2,100003,18000.00);

-- ==========================
-- MOVIMENTAÇÃO LOTE
-- ==========================
INSERT INTO movimentacao_lote
(id_lote, localizacao, data_movimentacao, responsavel, estado_produto, ultima_revisao, proxima_revisao, setor)
VALUES
(1,'Corredor A - Prateleira 1','2026-08-01 09:30:00',3,'Novo','2026-08-01','2026-09-01','Estoque'),
(1,'Corredor A - Prateleira 2','2026-08-05 14:20:00',3,'Novo','2026-08-05','2026-09-05','Expedição'),
(2,'Corredor B - Prateleira 2','2026-08-02 10:00:00',2,'Novo','2026-08-02','2026-09-02','Estoque');

-- ==========================
-- ENTRADA
-- ==========================
INSERT INTO entrada
(data_entrada, nome_produto, id_produto, setor_produto, id_lote)
VALUES
('2026-08-01','Micro-ondas LG 32L',1,'Estoque',1),
('2026-08-02','Micro-ondas Electrolux 20L',2,'Estoque',2),
('2026-08-03','Micro-ondas Brastemp 30L',3,'Estoque',3);

-- ==========================
-- SAÍDA
-- ==========================
INSERT INTO saida
(id_entrada, data_saida, nome_produto, id_produto, setor_produto, id_lote)
VALUES
(1,'2026-08-10 15:30:00','Micro-ondas LG 32L',1,'Expedição',1),
(2,'2026-08-12 09:15:00','Micro-ondas Electrolux 20L',2,'Expedição',2);

SELECT * FROM nivel;
SELECT * FROM funcionario;
SELECT * FROM produto;
SELECT * FROM lote;
SELECT * FROM movimentacao_lote;
SELECT * FROM entrada;
SELECT * FROM saida;
SELECT * FROM ajuste;