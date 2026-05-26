# Quickstart - Backend

## Pre-requisitos

- Java 21+ instalado (`java -version`)
- Docker e Docker Compose instalados
- Maven 3.9+ **ou** usar o Maven Wrapper incluso (`./mvnw`)

---

## 1. Subir a infraestrutura (PostgreSQL + Ollama)

Na raiz do projeto (`Chatbot-AI- Empresarial/`):

```bash
docker compose up postgres ollama -d
```

Aguarde o PostgreSQL ficar saudavel:

```bash
docker compose ps
# postgres deve estar "healthy"
```

---

## 2. Baixar os modelos no Ollama

```bash
# Modelo de linguagem (chat)
ollama pull llama3.2

# Modelo de embeddings (vetorizacao dos documentos)
ollama pull nomic-embed-text
```

> Se nao tiver o Ollama instalado localmente, acesse http://ollama.com/download

---

## 3. Configurar variaveis de ambiente (opcional)

As configuracoes padrao ja funcionam com o Docker Compose.
Para customizar, edite `src/main/resources/application.properties` ou exporte as variaveis:

```bash
export POSTGRES_URL=jdbc:postgresql://localhost:5432/aetherdb
export POSTGRES_USER=aether
export POSTGRES_PASSWORD=aether123
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_CHAT_MODEL=llama3.2
export OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

Para usar o **Groq** como fallback (sem GPU):

```bash
export GROQ_API_KEY=sua_chave_aqui
```

Depois descomente as linhas do Groq em `application.properties`.

---

## 4. Iniciar o backend em modo desenvolvimento

Dentro da pasta `backend/`:

```bash
./mvnw quarkus:dev
```

No Windows (PowerShell ou CMD):

```cmd
mvnw.cmd quarkus:dev
```

O Quarkus iniciara em modo dev com hot reload ativo.

Saida esperada:
```
__  ____  __  _____   ___  __ ____  ______
 --/ __ \/ / / / _ | / _ \/ //_/ / / / __/
 -/ /_/ / /_/ / __ |/ , _/ ,< / /_/ /\ \
--\___\_\____/_/ |_/_/|_/_/|_|\____/___/
...
Listening on: http://localhost:8080
```

---

## 5. Verificar se esta funcionando

```bash
# Health check
curl http://localhost:8080/q/health

# Swagger UI (documentacao interativa)
# Acesse no navegador:
# http://localhost:8080/swagger-ui
```

---

## 6. Indexar documentos de teste

Coloque PDFs ou arquivos `.txt` / `.md` na pasta `documents/` e execute o seed:

```bash
# Na raiz do projeto
./infra/seed.sh ./documents/
```

Ou envie diretamente pela API:

```bash
curl -X POST http://localhost:8080/api/documents/upload \
  -F "file=@./documents/manual.pdf"
```

---

## 7. Testar o chat

```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Qual e a politica de ferias da empresa?"}'
```

Resposta esperada:
```json
{
  "answer": "...",
  "sessionId": "uuid-gerado",
  "sources": [...],
  "timestamp": "..."
}
```

---

## Comandos uteis

| Comando | Descricao |
|---------|-----------|
| `./mvnw quarkus:dev` | Inicia em modo dev (hot reload) |
| `./mvnw test` | Executa os testes |
| `./mvnw package` | Gera o JAR de producao |
| `./mvnw package -Pnative` | Build nativo (requer GraalVM) |
| `docker compose logs postgres` | Ver logs do banco |
| `docker compose logs ollama` | Ver logs do Ollama |

---

## Solucao de problemas

**Erro: `Connection refused` no PostgreSQL**
```bash
# Verifique se o container esta rodando
docker compose ps
# Reinicie se necessario
docker compose restart postgres
```

**Erro: `model not found` no Ollama**
```bash
# Confirme que os modelos foram baixados
ollama list
```

**Porta 8080 em uso**
```bash
# Mude a porta no application.properties
quarkus.http.port=8081
```

**Flyway: erro de migration**
```bash
# Verifique os logs
./mvnw quarkus:dev 2>&1 | grep -i flyway
```