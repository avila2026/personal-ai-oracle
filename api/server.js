// personal-ai-oracle/api/server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ORACLE_API_KEY || 'super-secret-key-do-chefe';

// Middleware para JSON body parsing
app.use(express.json());

// Caminhos para os arquivos de dados
const dataDirPath = path.join(__dirname, '..', 'data');
const profileFilePath = path.join(dataDirPath, 'user_profile.json');
const insightsFilePath = path.join(dataDirPath, 'user_insights.json');
const insightsDir = path.join(dataDirPath, 'insights');
const changelogFilePath = path.join(dataDirPath, 'changelog.json');

// ════════════════════════════════════════════════════
// Middleware de Autenticação
// ════════════════════════════════════════════════════

app.use((req, res, next) => {
  // Permite acesso à raiz e health check sem autenticação
  if (req.path === '/' || req.path === '/health') return next();

  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized',
      detail: 'X-API-Key inválida ou ausente.',
    });
  }
  next();
});

// ════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ════════════════════════════════════════════════════
// Endpoints
// ════════════════════════════════════════════════════

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Oráculo de Identidade Pessoal',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// GET /profile — Retorna o perfil completo
app.get('/profile', (req, res) => {
  try {
    const userProfile = readJSON(profileFilePath);
    const userInsights = readJSON(insightsFilePath);

    res.json({
      status: 'success',
      data: {
        profile: userProfile,
        insights: userInsights,
      },
    });
  } catch (error) {
    console.error('Erro ao servir /profile:', error.message);
    res.status(500).json({ error: 'Internal Server Error', detail: error.message });
  }
});

// GET /context — Resumo otimizado para agentes de IA (prompt-ready)
app.get('/context', (req, res) => {
  try {
    const profile = readJSON(profileFilePath);

    // Construir um contexto otimizado para LLMs consumirem
    const context = {
      status: 'success',
      formato: 'prompt-ready',
      contexto: `O usuário se chama ${profile.nome}. ` +
        `Seus principais interesses são: ${(profile.interesses || []).join(', ')}. ` +
        `Seus valores pessoais são: ${(profile.valores_pessoais || []).join(', ')}. ` +
        `Seus pontos fortes incluem: ${(profile.pontos_fortes || []).join(', ')}. ` +
        `Estilo de comunicação: ${profile.estilo_comunicacao || 'não definido'}. ` +
        `Estilo de aprendizagem: ${profile.estilo_aprendizagem}. ` +
        `Humor recente: ${profile.humor_recente}. ` +
        `Meta profissional: ${profile.metas_profissionais}.`,
      dados_estruturados: {
        nome: profile.nome,
        interesses: profile.interesses,
        valores: profile.valores_pessoais,
        pontos_fortes: profile.pontos_fortes,
        estilo_comunicacao: profile.estilo_comunicacao,
        meta: profile.metas_profissionais,
        humor: profile.humor_recente,
      },
    };

    res.json(context);
  } catch (error) {
    console.error('Erro ao servir /context:', error.message);
    res.status(500).json({ error: 'Internal Server Error', detail: error.message });
  }
});

// GET /insights/:tipo — Retorna um tipo específico de insight
app.get('/insights/:tipo', (req, res) => {
  try {
    const tipo = req.params.tipo;
    const validTypes = ['talentos', 'decisoes', 'produtividade', 'previsao'];

    if (!validTypes.includes(tipo)) {
      return res.status(400).json({
        error: 'Bad Request',
        detail: `Tipo inválido: "${tipo}". Tipos válidos: ${validTypes.join(', ')}`,
      });
    }

    const insightFile = path.join(insightsDir, `analise_${tipo === 'previsao' ? 'previsao_comportamental' : tipo}.json`);
    const fileMapping = {
      talentos: 'analise_talentos.json',
      decisoes: 'analise_decisoes.json',
      produtividade: 'analise_produtividade.json',
      previsao: 'previsao_comportamental.json',
    };

    const filePath = path.join(insightsDir, fileMapping[tipo]);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'Not Found',
        detail: `Insight "${tipo}" ainda não foi gerado. Execute: node src/generateInsights.js --tipo ${tipo}`,
      });
    }

    const insight = readJSON(filePath);
    res.json({ status: 'success', data: insight });
  } catch (error) {
    console.error('Erro ao servir /insights:', error.message);
    res.status(500).json({ error: 'Internal Server Error', detail: error.message });
  }
});

// POST /decisions — Registra uma nova decisão do usuário
app.post('/decisions', (req, res) => {
  try {
    const { descricao, contexto, resultado } = req.body;

    if (!descricao) {
      return res.status(400).json({
        error: 'Bad Request',
        detail: 'O campo "descricao" é obrigatório.',
      });
    }

    const profile = readJSON(profileFilePath);

    if (!Array.isArray(profile.decisoes_recentes)) {
      profile.decisoes_recentes = [];
    }

    const decisao = {
      data: new Date().toISOString(),
      descricao,
      contexto: contexto || '',
      resultado: resultado || '',
    };

    profile.decisoes_recentes.push(decisao);
    profile.ultima_atualizacao = new Date().toISOString();
    writeJSON(profileFilePath, profile);

    // Registrar no changelog
    let changelog = [];
    if (fs.existsSync(changelogFilePath)) {
      try { changelog = readJSON(changelogFilePath); } catch { changelog = []; }
    }
    changelog.push({
      data: new Date().toISOString(),
      campo: 'decisoes_recentes',
      valor_anterior: 'nova entrada via API',
      valor_novo: decisao,
    });
    writeJSON(changelogFilePath, changelog);

    res.status(201).json({
      status: 'success',
      message: 'Decisão registrada com sucesso.',
      data: decisao,
    });
  } catch (error) {
    console.error('Erro ao registrar decisão:', error.message);
    res.status(500).json({ error: 'Internal Server Error', detail: error.message });
  }
});

// POST /feedback — Agentes enviam feedback sobre utilidade do contexto
app.post('/feedback', (req, res) => {
  try {
    const { agente, endpoint_consultado, utilidade, comentario } = req.body;

    if (!agente || utilidade === undefined) {
      return res.status(400).json({
        error: 'Bad Request',
        detail: 'Campos obrigatórios: "agente" (string), "utilidade" (1-5).',
      });
    }

    const feedbackDir = path.join(dataDirPath, 'feedback');
    if (!fs.existsSync(feedbackDir)) {
      fs.mkdirSync(feedbackDir, { recursive: true });
    }

    const feedbackFile = path.join(feedbackDir, 'agent_feedback.json');
    let feedbacks = [];
    if (fs.existsSync(feedbackFile)) {
      try { feedbacks = readJSON(feedbackFile); } catch { feedbacks = []; }
    }

    const entry = {
      data: new Date().toISOString(),
      agente,
      endpoint_consultado: endpoint_consultado || '',
      utilidade: Math.min(5, Math.max(1, Number(utilidade))),
      comentario: comentario || '',
    };

    feedbacks.push(entry);
    writeJSON(feedbackFile, feedbacks);

    res.status(201).json({
      status: 'success',
      message: 'Feedback registrado. Obrigado!',
      data: entry,
    });
  } catch (error) {
    console.error('Erro ao registrar feedback:', error.message);
    res.status(500).json({ error: 'Internal Server Error', detail: error.message });
  }
});

// GET /evolution — Mostra a evolução do perfil ao longo do tempo
app.get('/evolution', (req, res) => {
  try {
    if (!fs.existsSync(changelogFilePath)) {
      return res.json({
        status: 'success',
        data: { mensagem: 'Nenhuma evolução registrada ainda.', changelog: [] },
      });
    }

    const changelog = readJSON(changelogFilePath);
    const campo = req.query.campo; // filtrar por campo específico

    const filtered = campo
      ? changelog.filter(entry => entry.campo === campo)
      : changelog;

    res.json({
      status: 'success',
      data: {
        total_mudancas: filtered.length,
        changelog: filtered,
      },
    });
  } catch (error) {
    console.error('Erro ao servir /evolution:', error.message);
    res.status(500).json({ error: 'Internal Server Error', detail: error.message });
  }
});

// ════════════════════════════════════════════════════
// Inicializar Servidor
// ════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log('');
  console.log('🔮 ════════════════════════════════════════════════════');
  console.log('   ORÁCULO DE IDENTIDADE — API v2.0');
  console.log('   ════════════════════════════════════════════════════');
  console.log(`   🌐 Porta:     ${PORT}`);
  console.log(`   🔑 API Key:   ${API_KEY}`);
  console.log('');
  console.log('   📡 Endpoints:');
  console.log(`      GET  /health           — Status do serviço`);
  console.log(`      GET  /profile          — Perfil completo + insights`);
  console.log(`      GET  /context          — Contexto prompt-ready para LLMs`);
  console.log(`      GET  /insights/:tipo   — Insight específico (talentos|decisoes|produtividade|previsao)`);
  console.log(`      POST /decisions        — Registrar nova decisão`);
  console.log(`      POST /feedback         — Feedback de agentes`);
  console.log(`      GET  /evolution        — Evolução do perfil (?campo=humor_recente)`);
  console.log('');
  console.log(`   🚀 Teste: curl -H "X-API-Key: ${API_KEY}" http://localhost:${PORT}/context`);
  console.log('   ════════════════════════════════════════════════════\n');
});