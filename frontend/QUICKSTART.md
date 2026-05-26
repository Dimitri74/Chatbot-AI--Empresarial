# Quickstart - Frontend

## Pre-requisitos

- Node.js 20+ instalado (`node -v`)
- npm 10+ (`npm -v`)
- Backend rodando em `http://localhost:8080` (veja `backend/QUICKSTART.md`)

---

## 1. Instalar dependencias

Dentro da pasta `frontend/`:

```bash
npm install
```

---

## 2. Configurar variaveis de ambiente

Crie um arquivo `.env.local` na pasta `frontend/`:

```bash
# frontend/.env.local

# URL do backend (padrao ja funciona com o backend local)
NEXT_PUBLIC_API_URL=http://localhost:8080
```

> O arquivo `.env.local` ja esta no `.gitignore` — nao sera enviado ao repositorio.

---

## 3. Iniciar em modo desenvolvimento

```bash
npm run dev
```

Saida esperada:
```
  ▲ Next.js 15.1.0 (Turbopack)
  - Local:        http://localhost:3000
  - Network:      http://0.0.0.0:3000
```

Acesse no navegador: **http://localhost:3000**

---

## 4. Usar o chatbot

1. Abra `http://localhost:3000`
2. Clique no icone de clipe para enviar um documento (PDF, TXT ou MD)
3. Aguarde a confirmacao de indexacao
4. Digite sua pergunta e pressione **Enter**
5. As respostas aparecem com as fontes citadas abaixo

---

## 5. Alternar modo claro / escuro

Clique no botao **"Escuro"** / **"Claro"** no canto superior direito da interface.

---

## Comandos uteis

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento (hot reload) |
| `npm run build` | Gera o build de producao |
| `npm run start` | Inicia o servidor de producao (requer build) |
| `npm run lint` | Verifica erros de lint no codigo |

---

## Build de producao

```bash
npm run build
npm run start
```

O frontend ficara disponivel em `http://localhost:3000`.

---

## Rodar com Docker

Na raiz do projeto (`Chatbot-AI- Empresarial/`):

```bash
# Sobe tudo (banco + ollama + backend + frontend)
docker compose --profile full up -d
```

> Requer que o backend tenha sido compilado antes: `cd backend && ./mvnw package`

---

## Solucao de problemas

**Erro: `ECONNREFUSED` ao enviar mensagem**

O frontend nao consegue conectar ao backend. Verifique:
```bash
# Backend deve estar rodando
curl http://localhost:8080/q/health

# Confirme a URL no .env.local
cat .env.local
```

**Erro: `Module not found`**
```bash
# Reinstale as dependencias
rm -rf node_modules .next
npm install
npm run dev
```

**Porta 3000 em uso**

Rode em outra porta:
```bash
npm run dev -- -p 3001
```

**Upload de documento nao funciona**

- Formatos suportados: `.pdf`, `.txt`, `.md`, `.docx`
- Tamanho maximo: sem limite definido no MVP (ajuste no backend se necessario)
- Verifique os logs do backend para erros de processamento