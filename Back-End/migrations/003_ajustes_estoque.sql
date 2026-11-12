-- Permite registrar alterações de setor, localização e conservação no histórico.
ALTER TABLE movimentacao_estoque
    MODIFY COLUMN tipo ENUM('entrada', 'saida', 'ajuste') NOT NULL;
