CREATE TABLE IF NOT EXISTS devolucao (
    id_devolucao INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_lote INT NOT NULL,
    id_funcionario INT NOT NULL,
    revisado_por INT NULL,
    quantidade INT NOT NULL,
    motivo VARCHAR(500) NOT NULL,
    foto VARCHAR(255) NOT NULL,
    status ENUM('pendente', 'em_analise', 'reintegrada', 'recusada') NOT NULL DEFAULT 'pendente',
    data_devolucao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_revisao DATETIME NULL,
    CONSTRAINT fk_devolucao_produto FOREIGN KEY (id_produto) REFERENCES produto(id_produto),
    CONSTRAINT fk_devolucao_lote FOREIGN KEY (id_lote) REFERENCES lote(id_lote),
    CONSTRAINT fk_devolucao_funcionario FOREIGN KEY (id_funcionario) REFERENCES funcionario(id_funcionario),
    CONSTRAINT fk_devolucao_revisor FOREIGN KEY (revisado_por) REFERENCES funcionario(id_funcionario),
    INDEX idx_devolucao_status_data (status, data_devolucao)
);