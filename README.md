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