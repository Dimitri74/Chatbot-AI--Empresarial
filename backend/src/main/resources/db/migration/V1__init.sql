-- Flyway migration V1 - Schema inicial
-- Nota: a extensao pgvector e criada pelo init.sql do Docker
-- Em producao sem Docker, execute: CREATE EXTENSION IF NOT EXISTS vector;

-- Sessoes de conversa
CREATE TABLE IF NOT EXISTS conversation_sessions (
    id          VARCHAR(36) PRIMARY KEY,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    metadata    TEXT
);

-- Historico de mensagens
CREATE TABLE IF NOT EXISTS chat_messages (
    id          BIGSERIAL PRIMARY KEY,
    session_id  VARCHAR(36) NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
    role        VARCHAR(20) NOT NULL,
    content     TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Registro de documentos indexados
CREATE TABLE IF NOT EXISTS indexed_documents (
    id          BIGSERIAL PRIMARY KEY,
    file_name   VARCHAR(255) NOT NULL,
    file_type   VARCHAR(50)  NOT NULL,
    file_size   BIGINT,
    chunk_count INTEGER      DEFAULT 0,
    status      VARCHAR(20)  NOT NULL DEFAULT 'PROCESSING',
    error_msg   TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);