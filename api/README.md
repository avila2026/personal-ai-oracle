# 🔮 API do Oráculo de Identidade Pessoal — v2.0

API inteligente que permite que agentes de IA e sistemas externos consultem, alimentem e interajam com o perfil cognitivo do usuário.

## Endpoints

### 🟢 Público

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Status do serviço (não requer autenticação) |

### 🔐 Autenticados (requer `X-API-Key`)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/profile` | Perfil completo + insights consolidados |
| `GET` | `/context` | Resumo otimizado para LLMs (prompt-ready) |
| `GET` | `/insights/:tipo` | Insight específico (`talentos`, `decisoes`, `produtividade`, `previsao`) |
| `POST` | `/decisions` | Registra uma nova decisão do usuário |
| `POST` | `/feedback` | Agentes enviam feedback sobre utilidade do contexto |
| `GET` | `/evolution` | Histórico de mudanças do perfil (suporta `?campo=...`) |

## Autenticação

Todas as requisições (exceto `/health`) exigem um `X-API-Key` válido no cabeçalho:

```
X-API-Key: SEU_TOKEN_AQUI
```

## Exemplos

### Consultar contexto para LLM
```bash
curl -H "X-API-Key: super-secret-key-do-chefe" http://localhost:3000/context
```

### Registrar uma decisão
```bash
curl -X POST http://localhost:3000/decisions \
  -H "X-API-Key: super-secret-key-do-chefe" \
  -H "Content-Type: application/json" \
  -d '{"descricao": "Decidi focar em Rust", "contexto": "Performance é prioridade"}'
```

### Consultar insight de talentos
```bash
curl -H "X-API-Key: super-secret-key-do-chefe" http://localhost:3000/insights/talentos
```

### Enviar feedback como agente
```bash
curl -X POST http://localhost:3000/feedback \
  -H "X-API-Key: super-secret-key-do-chefe" \
  -H "Content-Type: application/json" \
  -d '{"agente": "MeuAgente-v1", "utilidade": 5, "comentario": "Contexto muito útil"}'
```

## Erros

| Código | Significado |
|--------|-------------|
| `400` | Requisição inválida (campos obrigatórios faltando) |
| `401` | Chave de API ausente ou inválida |
| `404` | Insight solicitado ainda não foi gerado |
| `500` | Erro interno no servidor |
