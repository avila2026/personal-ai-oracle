# 🔮 Personal AI Oracle — Identity Layer for AI Agents

O **Personal AI Oracle (Oráculo)** é uma camada de identidade cognitiva universal. Em vez de "ensinar" quem você é para cada nova IA (ChatGPT, Claude, Gemini), o Oráculo centraliza esse conhecimento, funcionando como uma fonte da verdade sobre sua personalidade, talentos, metas e padrões de comportamento.

---

## 🔥 Novidades da v2.0

A versão 2.0 transforma o Oráculo de um repositório estático em um sistema vivo e dinâmico:

- **Núcleo Inteligente**: Perfil expandido com dimensões de valores, pontos fortes, estilo de comunicação e histórico de decisões.
- **Motor de Insights Multi-Análise**: 4 tipos de análise especializada (Talentos, Decisões, Produtividade e Previsão) via LLM local.
- **API Inteligente**: 7 endpoints para integração com agentes de IA, incluindo resumos prontos para prompts.
- **CLI de Gestão**: Ferramenta interativa para atualizar seu perfil e registrar decisões sem tocar em arquivos JSON.
- **Changelog Automático**: Rastreamento completo da evolução da sua identidade digital.

---

## 🏗️ Estrutura do Projeto

- `api/`: Servidor Express com a API de distribuição.
- `src/`: Lógica central (coleta de dados, geração de insights, CLI).
- `data/`: Armazenamento persistente (JSONs, schemas e changelogs).
- `test-api.js`: Suite de testes para garantir integridade da API.

---

## 🚀 Como Começar

### 1. Instalação
```bash
# Clone o repositório
git clone https://github.com/avila2026/personal-ai-oracle.git
cd personal-ai-oracle

# Instale as dependências da API
cd api
npm install
cd ..
```

### 2. Configuração do LLM Local
O Oráculo utiliza o **Ollama** para processar insights com privacidade total.
- Instale o [Ollama](https://ollama.com/).
- Baixe o modelo Qwen: `ollama run qwen2.5:0.5b`.

### 3. Uso do Oráculo (CLI)
Gerencie sua identidade diretamente pelo terminal:

```bash
# Mostrar perfil atual formatado
node src/updateProfile.js --mostrar

# Atualizar humor
node src/updateProfile.js --campo humor_recente --valor "focado em automação"

# Adicionar um interesse
node src/updateProfile.js --campo interesses --adicionar "machine learning"

# Registrar uma decisão importante
node src/updateProfile.js --decisao "Mudei o foco para Rust" --contexto "Necessidade de performance"
```

### 4. Geração de Insights
Transforme dados brutos em análise estratégica:
```bash
# Gerar TODAS as análises
node src/generateInsights.js

# Gerar apenas análise de talentos
node src/generateInsights.js --tipo talentos
```

---

## 📡 API de Integração

A API roda por padrão na porta `3000` e requer a chave `X-API-Key`.

| Rota | Descrição |
|---|---|
| `GET /context` | **Principal** — Retorna um resumo otimizado para injetar no sistema de agentes. |
| `GET /profile` | Retorna o perfil completo e todos os insights. |
| `GET /insights/:tipo` | Retorna um insight específico (talentos, decisoes, produtividade, previsao). |
| `POST /decisions` | Registra uma nova decisão via sistema externo. |
| `GET /evolution` | Retorna o histórico de mudanças do perfil. |

---

## 🎯 Roadmap de Evolução

- [x] **Fase 1**: Núcleo Dinâmico e Versionamento.
- [x] **Fase 2**: API Inteligente v2.0.
- [ ] **Fase 3**: Memória de Longo Prazo (Banco Vetorial ChromaDB).
- [ ] **Fase 4**: Coletores Automáticos (GitHub, Obsidian).
- [ ] **Fase 5**: Dashboard Visual Premium (Vite + CSS).
- [ ] **Fase 6**: SDK Universal.

---
*Desenvolvido por Jean Carlos com suporte da Antigravity (Advanced Agentic Coding).*
