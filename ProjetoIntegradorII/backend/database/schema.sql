-- Sistema de Atendimentos de Pronto Socorro
-- Banco de dados: PostgreSQL

CREATE TABLE IF NOT EXISTS pacientes (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(150) NOT NULL,
    endereco VARCHAR(200),
    rg VARCHAR(20),
    cpf VARCHAR(14) NOT NULL,
    nome_pai VARCHAR(150),
    nome_mae VARCHAR(150),
    data_nascimento DATE NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS atendimentos (
    id SERIAL PRIMARY KEY,
    numero_atendimento VARCHAR(10) UNIQUE NOT NULL,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
    status VARCHAR(30) NOT NULL DEFAULT 'aguardando_triagem',
    -- status: aguardando_triagem | aguardando_medico | confirmado | cancelado
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS triagens (
    id SERIAL PRIMARY KEY,
    atendimento_id INTEGER UNIQUE NOT NULL REFERENCES atendimentos(id),
    pressao_arterial VARCHAR(15),
    temperatura_corporal NUMERIC(4,1),
    batimentos_cardiacos INTEGER,
    queixas TEXT,
    classificacao_manchester VARCHAR(10) NOT NULL,
    -- classificacao_manchester: vermelho | laranja | amarelo | verde | azul
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS atendimentos_medicos (
    id SERIAL PRIMARY KEY,
    atendimento_id INTEGER UNIQUE NOT NULL REFERENCES atendimentos(id),
    medicacoes TEXT,
    confirmado_em TIMESTAMP
);
