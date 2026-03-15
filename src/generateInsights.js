// personal-ai-oracle/src/generateInsights.js
const fs = require('fs');
const path = require('path');

const dataDirPath = path.join(__dirname, '..', 'data');
const profileFilePath = path.join(dataDirPath, 'user_profile.json');
const insightsDir = path.join(dataDirPath, 'insights');

// ════════════════════════════════════════════════════
// Definição dos Tipos de Análise
// ════════════════════════════════════════════════════

const ANALYSIS_TYPES = {
  talentos: {
    name: 'Análise de Talentos',
    emoji: '💎',
    file: 'analise_talentos.json',
    buildPrompt: (profile) => `Você é um analista de talentos e competências humanas. Analise o perfil abaixo e identifique:

1. Os 5 principais talentos naturais (baseado nos interesses, pontos fortes e histórico)
2. Competências técnicas demonstradas
3. Competências comportamentais inferidas
4. Potenciais ocultos (talentos que o usuário talvez não perceba que tem)

Perfil:
${JSON.stringify(profile, null, 2)}

RETORNE APENAS um JSON válido com as chaves: "talentos_naturais" (array), "competencias_tecnicas" (array), "competencias_comportamentais" (array), "potenciais_ocultos" (array com objetos: {talento, justificativa}). Seja específico e perspicaz.`
  },

  decisoes: {
    name: 'Análise de Decisões',
    emoji: '🧭',
    file: 'analise_decisoes.json',
    buildPrompt: (profile) => `Você é um analista de padrões de tomada de decisão. Analise o perfil abaixo e identifique:

1. Padrão dominante de decisão (intuitivo, analítico, impulsivo, cauteloso)
2. Vieses cognitivos observáveis
3. Fatores que mais influenciam suas decisões
4. Recomendações para melhorar a qualidade das decisões

Perfil:
${JSON.stringify(profile, null, 2)}

RETORNE APENAS um JSON válido com as chaves: "padrao_dominante" (string), "vieses_observados" (array), "fatores_influenciadores" (array), "recomendacoes" (array). Seja analítico e construtivo.`
  },

  produtividade: {
    name: 'Análise de Produtividade',
    emoji: '⚡',
    file: 'analise_produtividade.json',
    buildPrompt: (profile) => `Você é um coach de produtividade e performance. Analise o perfil abaixo e identifique:

1. Padrões de produtividade baseado no histórico de tarefas
2. Tipos de tarefas onde o usuário tem melhor performance
3. Ambientes e condições ideais de trabalho
4. Armadilhas de produtividade a evitar
5. Estratégia personalizada de produtividade (3 ações concretas)

Perfil:
${JSON.stringify(profile, null, 2)}

RETORNE APENAS um JSON válido com as chaves: "padroes_produtividade" (array), "tarefas_alta_performance" (array), "ambiente_ideal" (objeto com chaves: fisico, digital, social), "armadilhas" (array), "estrategia_personalizada" (array de objetos: {acao, motivo}).`
  },

  previsao: {
    name: 'Previsão Comportamental',
    emoji: '🔮',
    file: 'previsao_comportamental.json',
    buildPrompt: (profile) => `Você é um analista preditivo de comportamento humano. Com base no perfil abaixo, faça previsões:

1. Quais tipos de projetos o usuário provavelmente vai começar nos próximos 3 meses
2. Quais obstáculos internos provavelmente vai enfrentar
3. Qual a probabilidade de atingir a meta profissional e o que pode acelerar/atrasar
4. Evolução prevista de humor e motivação

Perfil:
${JSON.stringify(profile, null, 2)}

RETORNE APENAS um JSON válido com as chaves: "projetos_provaveis" (array), "obstaculos_internos" (array com objetos: {obstaculo, sugestao_superacao}), "meta_profissional" (objeto: {probabilidade_percentual, aceleradores, atrasadores}), "previsao_emocional" (string com 2-3 frases). Seja realista e construtivo.`
  }
};

// ════════════════════════════════════════════════════
// Motor de Geração de Insights
// ════════════════════════════════════════════════════

/**
 * Chama o Ollama local para gerar uma resposta.
 */
async function callOllama(prompt, model = 'qwen2.5:0.5b') {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama retornou status ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  let jsonString = data.response.trim();

  // Limpar blocos de código markdown
  if (jsonString.startsWith('```json')) {
    jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (jsonString.startsWith('```')) {
    jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  return JSON.parse(jsonString);
}

/**
 * Gera um tipo específico de insight.
 */
async function generateSingleInsight(type) {
  const config = ANALYSIS_TYPES[type];
  if (!config) {
    throw new Error(`Tipo de análise desconhecido: "${type}". Tipos válidos: ${Object.keys(ANALYSIS_TYPES).join(', ')}`);
  }

  console.log(`\n${config.emoji} Gerando ${config.name}...`);

  const profileContent = fs.readFileSync(profileFilePath, 'utf8');
  const userProfile = JSON.parse(profileContent);
  const prompt = config.buildPrompt(userProfile);

  const insights = await callOllama(prompt);

  // Criar diretório de insights se não existir
  if (!fs.existsSync(insightsDir)) {
    fs.mkdirSync(insightsDir, { recursive: true });
  }

  // Salvar com metadata
  const result = {
    tipo: type,
    nome: config.name,
    gerado_em: new Date().toISOString(),
    modelo: 'qwen2.5:0.5b',
    dados: insights,
  };

  const filePath = path.join(insightsDir, config.file);
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`✅ ${config.name} salva em: ${filePath}`);

  return result;
}

/**
 * Gera TODOS os tipos de insights.
 */
async function generateAllInsights() {
  console.log('🔮 ════════════════════════════════════════════════════');
  console.log('   ORÁCULO DE IDENTIDADE — Geração Completa de Insights');
  console.log('   ════════════════════════════════════════════════════\n');

  const results = {};
  const types = Object.keys(ANALYSIS_TYPES);

  for (const type of types) {
    try {
      results[type] = await generateSingleInsight(type);
    } catch (error) {
      console.error(`❌ Erro ao gerar "${type}": ${error.message}`);
      results[type] = { erro: error.message };
    }
  }

  // Salvar também um resumo consolidado para retrocompatibilidade
  const consolidatedPath = path.join(dataDirPath, 'user_insights.json');
  const consolidated = {
    version: '2.0.0',
    gerado_em: new Date().toISOString(),
    tipos_gerados: types,
    resumo: results,
  };
  fs.writeFileSync(consolidatedPath, JSON.stringify(consolidated, null, 2), 'utf8');

  console.log('\n════════════════════════════════════════════════════');
  console.log(`✅ ${types.length} análises geradas com sucesso!`);
  console.log('════════════════════════════════════════════════════\n');

  return results;
}

/**
 * Lista os tipos de análise disponíveis.
 */
function listTypes() {
  console.log('\n🔮 Tipos de Análise Disponíveis:\n');
  for (const [key, config] of Object.entries(ANALYSIS_TYPES)) {
    console.log(`   ${config.emoji}  ${key.padEnd(16)} — ${config.name}`);
  }
  console.log('\nUso:');
  console.log('  node src/generateInsights.js                  → Gera TODAS as análises');
  console.log('  node src/generateInsights.js --tipo talentos   → Gera apenas análise de talentos');
  console.log('  node src/generateInsights.js --listar           → Lista tipos disponíveis\n');
}

// ════════════════════════════════════════════════════
// CLI
// ════════════════════════════════════════════════════

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--listar')) {
    listTypes();
    process.exit(0);
  }

  const tipoIndex = args.indexOf('--tipo');
  if (tipoIndex !== -1 && args[tipoIndex + 1]) {
    const tipo = args[tipoIndex + 1];
    generateSingleInsight(tipo).catch((err) => {
      console.error(`❌ Erro: ${err.message}`);
      process.exit(1);
    });
  } else {
    generateAllInsights().catch((err) => {
      console.error(`❌ Erro: ${err.message}`);
      process.exit(1);
    });
  }
}

module.exports = { generateSingleInsight, generateAllInsights, ANALYSIS_TYPES };