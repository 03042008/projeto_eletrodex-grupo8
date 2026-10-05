-- Execute uma vez em bancos existentes antes de iniciar a nova versão da API.
ALTER TABLE saida
    ADD COLUMN id_funcionario INT NULL,
    ADD CONSTRAINT fk_saida_funcionario
        FOREIGN KEY (id_funcionario) REFERENCES funcionario(id_funcionario);

ALTER TABLE funcionario
    MODIFY COLUMN senha VARCHAR(255) NOT NULL;

INSERT INTO nivel (descricao)
SELECT CONVERT(0x46756E63696F6EC3A172696F USING utf8mb4)
WHERE NOT EXISTS (
    SELECT 1 FROM nivel WHERE HEX(descricao) = '46756E63696F6EC3A172696F'
);
