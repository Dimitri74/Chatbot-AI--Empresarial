# 🌐 Aether AI - Assistente Inteligente Empresarial com RAG

**Chatbot corporativo inteligente usando Retrieval-Augmented Generation (RAG)**

Uma solução completa para consulta inteligente de documentos internos (manuais, políticas, procedimentos, catálogos etc.), desenvolvida com as melhores tecnologias Java modernas.

![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)
![Quarkus](https://img.shields.io/badge/Quarkus-4695EB?logo=quarkus&logoColor=white)
![LangChain4j](https://img.shields.io/badge/LangChain4j-8A2BE2?logo=ai&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)

---

## 📋 Sobre o Projeto

**Aether AI** é um assistente virtual corporativo que permite aos funcionários fazerem perguntas em linguagem natural e receberem respostas precisas baseadas nos documentos internos da empresa, com **fontes citadas** (transparência total).

Desenvolvido como projeto de portfólio para demonstrar expertise em **Java moderno**, **Quarkus**, **RAG** e **Full Stack**.

**Empresa fictícia utilizada:** TechFlow Solutions (Software House)

---

## ✨ Funcionalidades Principais

- **Upload inteligente** de documentos (PDF, TXT, Markdown)
- **Processamento automático** com chunking e embeddings
- **Chat com memória** de conversa (contextual)
- **Respostas com fontes citadas** (muito valorizado)
- Interface moderna, responsiva e com modo escuro
- Integração com Ollama (local) e Groq (cloud)

---

## 🛠️ Stack Tecnológica

| Camada          | Tecnologia                              |
|-----------------|-----------------------------------------|
| **Backend**     | Java 21 + Quarkus 3.15+                 |
| **IA / RAG**    | LangChain4j + PgVector                  |
| **LLM**         | Ollama (llama3.2) + Groq (fallback)    |
| **Banco**       | PostgreSQL 16 + pgvector                |
| **Frontend**    | Next.js 15 + TypeScript + Tailwind CSS  |
| **UI**          | Shadcn/ui + Radix                       |
| **Infra**       | Docker + Docker Compose                 |

---

## 🎥 Demonstração

*(Insira aqui as screenshots quando tiver)*

**Exemplos de uso:**
- "Qual o procedimento de onboarding?"
- "Quais são os benefícios da empresa?"
- "Como funciona nossa política de home office?"

---

## 🚀 Como Executar

```bash
# Clone o projeto
git clone https://github.com/Dimitri74/Chatbot-AI--Empresarial.git
cd Chatbot-AI--Empresarial

# Subir infraestrutura
docker compose up -d

# Backend
cd backend
./mvnw quarkus:dev

# Frontend (novo terminal)
cd frontend
npm install
npm run dev
