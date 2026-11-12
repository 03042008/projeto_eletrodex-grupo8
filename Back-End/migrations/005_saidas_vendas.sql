ALTER TABLE saida MODIFY COLUMN id_entrada INT NULL;

SET @saida_tem_quantidade = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'saida' AND COLUMN_NAME = 'quantidade'
);
SET @saida_sql = IF(@saida_tem_quantidade = 0,
    'ALTER TABLE saida ADD COLUMN quantidade INT NOT NULL DEFAULT 1',
    'SELECT 1');
PREPARE saida_stmt FROM @saida_sql;
EXECUTE saida_stmt;
DEALLOCATE PREPARE saida_stmt;

SET @saida_tem_funcionario = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'saida' AND COLUMN_NAME = 'id_funcionario'
);
SET @saida_sql = IF(@saida_tem_funcionario = 0,
    'ALTER TABLE saida ADD COLUMN id_funcionario INT NULL',
    'SELECT 1');
PREPARE saida_stmt FROM @saida_sql;
EXECUTE saida_stmt;
DEALLOCATE PREPARE saida_stmt;

SET @saida_tem_fk_funcionario = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'saida'
      AND CONSTRAINT_NAME = 'fk_saida_funcionario'
);
SET @saida_sql = IF(@saida_tem_fk_funcionario = 0,
    'ALTER TABLE saida ADD CONSTRAINT fk_saida_funcionario FOREIGN KEY (id_funcionario) REFERENCES funcionario(id_funcionario)',
    'SELECT 1');
PREPARE saida_stmt FROM @saida_sql;
EXECUTE saida_stmt;
DEALLOCATE PREPARE saida_stmt;
