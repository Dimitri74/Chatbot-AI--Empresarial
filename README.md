# Chatbot - Assistente Inteligente Empresarial

Chatbot inteligente com RAG (Retrieval-Augmented Generation) que responde perguntas com base em documentos internos da empresa. Desenvolvido com Quarkus + LangChain4j no backend e Next.js 15 no frontend.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Java 21 + Quarkus 3.15+ |
| IA / RAG | LangChain4j |
| Vector Store | PostgreSQL 16 + pgvector |
| LLM | Ollama (local) / Groq (fallback) |
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| UI Components | Shadcn/ui |
| Banco de Dados | PostgreSQL 16 |
| Infra | Docker + Docker Compose |

## Funcionalidades

- Upload de documentos (PDF, TXT, Markdown)
- Processamento automatico com chunking e embeddings
- Chat com historico de conversa
- Respostas com fontes citadas
- Interface responsiva com modo claro/escuro

## Pre-requisitos

- Docker e Docker Compose
- Java 21+
- Node.js 20+
- Ollama instalado localmente (ou acesso ao Groq)

## Como Rodar

### 1. Subir a infraestrutura

```bash
docker compose up postgres ollama -d
```

### 2. Baixar modelos no Ollama

```bash
# Modelo de chat
ollama pull llama3.2

# Modelo de embeddings
ollama pull nomic-embed-text
```

### 3. Backend

```bash
cd backend
./mvnw quarkus:dev
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:3000

### Rodar tudo com Docker

```bash
docker compose --profile full up -d
```

## Estrutura do Projeto

```
aether-ai-rag/
├── backend/                  # Quarkus (Java 21)
│   └── src/main/java/com/aether/
│       ├── config/           # Configuracoes do RAG e LLM
│       ├── controller/       # Endpoints REST
│       ├── service/          # Logica de negocio
│       ├── rag/              # Pipeline RAG
│       ├── document/         # Processamento de documentos
│       └── model/            # DTOs e entidades
├── frontend/                 # Next.js 15
│   ├── app/                  # App Router
│   ├── components/           # Componentes React
│   └── lib/                  # Utilitarios e API client
├── documents/                # Documentos para ingestao
├── infra/                    # Scripts SQL e seeds
└── docker-compose.yml
```

## Variaveis de Ambiente

Crie um arquivo `.env` na raiz ou configure as variaveis no `application.properties`:

| Variavel | Descricao | Padrao |
|----------|-----------|--------|
| `QUARKUS_DATASOURCE_JDBC_URL` | URL do PostgreSQL | `jdbc:postgresql://localhost:5432/aetherdb` |
| `OLLAMA_BASE_URL` | URL do Ollama | `http://localhost:11434` |
| `GROQ_API_KEY` | Chave da API Groq (fallback) | - |

## Endpoints da API

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| `POST` | `/api/chat` | Envia mensagem e recebe resposta |
| `POST` | `/api/documents/upload` | Faz upload de documento |
| `GET`  | `/api/documents` | Lista documentos indexados |
| `DELETE` | `/api/documents/{id}` | Remove documento |
| `GET`  | `/api/chat/history/{sessionId}` | Historico de conversa |

## Seguranca

### Camadas de protecao implementadas

#### Backend

**1. Protecao contra Prompt Injection** (`InputSanitizer.java`)
Detecta e bloqueia padroes de ataque em **portugues (PT-BR) e ingles (EN)** antes de enviar ao LLM.
8 categorias de padroes cobertos:

| Categoria                   | Exemplos bloqueados                                                        |
|-----------------------------|----------------------------------------------------------------------------|
| Override EN                 | "ignore previous instructions", "forget all rules"                        |
| Override PT-BR              | "ignore todas as instrucoes anteriores", "esqueça tudo"                   |
| Reset de contexto EN        | "from now on respond only with..."                                        |
| Reset de contexto PT-BR     | "a partir de agora responda apenas...", "de agora em diante"              |
| Mudanca de persona EN       | "act as", "you are now", "roleplay as"                                    |
| Mudanca de persona PT-BR    | "aja como", "finja ser", "assuma o papel de"                              |
| Extracao de prompt EN/PT-BR | "reveal your instructions", "mostre seu prompt"                           |
| Tokens de modelo            | `[INST]`, `<\|system\|>`, `###system`, `<<SYS>>`                         |
| Jailbreak EN/PT-BR          | "DAN mode", "modo desenvolvedor", "sem restricoes"                        |
| Reset de sessao EN/PT-BR    | "new conversation", "nova conversa", "reinicie o contexto"                |
| Meta-prompt                 | `[system]`, `<assistant>`, `<user>` aninhados                            |

**2. System Prompt Defensivo + Separacao Estrutural** (`AetherAiService.java`)
Duas camadas de defesa no prompt:
- **System message** com 10 regras absolutas que o modelo nao pode violar
- **Separacao estrutural**: o input do usuario e sempre encapsulado em `<pergunta>...</pergunta>`, ensinando explicitamente ao modelo que aquele conteudo e **dado**, nao instrucao. O `@UserMessage` template inclui um lembrete final antes da resposta.

**3. Rate Limiting** (`RateLimiterFilter.java`)
Limite de 20 requisicoes/minuto por IP nos endpoints `/api/chat` e `/api/documents`.
Configuravel via variavel de ambiente `RATE_LIMIT_RPM`.
Retorna HTTP 429 com header `Retry-After: 60` ao exceder o limite.

**4. Validacao de Upload** (`DocumentService.java`)
- Extensoes permitidas: `.pdf`, `.txt`, `.md`, `.markdown`
- Tamanho maximo: 10 MB
- Validacao de content-type
- Sanitizacao do nome do arquivo (prevencao de path traversal)

**5. Tratamento seguro de erros** (`DocumentController.java`, `ChatController.java`)
- Mensagens de erro internas nunca expostas ao cliente
- Erros de validacao retornam mensagens genericas seguras
- Logs de erro registrados no servidor com contexto (sem dados sensiveis)

**6. Log sem dados sensiveis** (`ChatService.java`)
- Conteudo das mensagens nunca registrado em log
- Apenas metadados: session ID e tamanho da mensagem

#### Frontend

**7. Sanitizacao de URLs no Markdown** (`MessageBubble.tsx`)
Bloqueia URLs maliciosas em respostas do LLM antes da renderizacao:
- `javascript:` — previne XSS via links
- `data:` — previne injecao de conteudo inline
- `vbscript:` — previne execucao de scripts legados

### Variaveis de ambiente de seguranca

| Variavel          | Descricao                         | Padrao |
|-------------------|-----------------------------------|--------|
| `RATE_LIMIT_RPM`  | Requisicoes por minuto por IP     | `20`   |

### O que ainda requer atencao em producao

| Item                  | Recomendacao                                                  |
|-----------------------|---------------------------------------------------------------|
| Autenticacao          | Implementar JWT ou OAuth2 para proteger os endpoints          |
| HTTPS                 | Configurar TLS — nunca expor em HTTP em producao              |
| CORS                  | Atualizar `quarkus.http.cors.origins` para o dominio real     |
| Autorizacao de upload | Restringir quem pode fazer upload de documentos               |
| Auditoria             | Registrar tentativas de injection bloqueadas em banco         |

## Desenvolvimento

### Executar testes

```bash
cd backend
./mvnw test
```

### Seed de documentos

```bash
./infra/seed.sh ./documents/
```