SET NAMES utf8mb4;

DROP DATABASE IF EXISTS ong_doacoes;
CREATE DATABASE ong_doacoes
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE ong_doacoes;

-- Modelo reconstruido para registrar doacoes em dinheiro, sem controle de beneficiarios.
CREATE TABLE doador (
  id_doador BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  tipo ENUM('pessoa_fisica', 'pessoa_juridica') NOT NULL,
  email VARCHAR(254) NULL,
  telefone VARCHAR(20) NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_doador),
  INDEX idx_doador_nome (nome)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE doacao (
  id_doacao BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_doador BIGINT UNSIGNED NOT NULL,
  valor DECIMAL(12, 2) UNSIGNED NOT NULL,
  data_doacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  forma_pagamento ENUM('pix', 'dinheiro', 'transferencia', 'cartao', 'boleto', 'outro') NOT NULL,
  status ENUM('pendente', 'confirmada', 'cancelada') NOT NULL DEFAULT 'pendente',
  observacoes VARCHAR(500) NULL,
  PRIMARY KEY (id_doacao),
  CONSTRAINT chk_doacao_valor_positivo CHECK (valor > 0),
  CONSTRAINT fk_doacao_doador
    FOREIGN KEY (id_doador)
    REFERENCES doador (id_doador)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  INDEX idx_doacao_doador_data (id_doador, data_doacao),
  INDEX idx_doacao_status (status)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
