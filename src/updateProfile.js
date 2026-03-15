// personal-ai-oracle/src/updateProfile.js
const fs = require('fs');
const path = require('path');

const dataDirPath = path.join(__dirname, '..', 'data');
const profileFilePath = path.join(dataDirPath, 'user_profile.json');
const changelogFilePath = path.join(dataDirPath, 'changelog.json');

/**
 * Carrega o perfil atual do disco.
 */
function loadProfile() {
  const raw = fs.readFileSync(profileFilePath, 'utf8');
  return JSON.parse(raw);
}

/**
 * Salva o perfil atualizado no disco e registra a mudança no changelog.
 */
function saveProfile(profile, campo, valorAnterior, valorNovo) {
  profile.ultima_atualizacao = new Date().toISOString();
  fs.writeFileSync(profileFilePath, JSON.stringify(profile, null, 2), 'utf8');

  // Registrar no changelog
  let changelog = [];
  if (fs.existsSync(changelogFilePath)) {
    try {
      changelog = JSON.parse(fs.readFileSync(changelogFilePath, 'utf8'));
    } catch {
      changelog = [];
    }
  }

  changelog.push({
    data: new Date().toISOString(),
    campo: campo,
    valor_anterior: valorAnterior,
    valor_novo: valorNovo,
  });

  fs.writeFileSync(changelogFilePath, JSON.stringify(changelog, null, 2), 'utf8');
}

/**
 * Atualiza um campo simples (string) do perfil.
 */
function updateStringField(campo, valor) {
  const profile = loadProfile();

  if (!(campo in profile)) {
    console.error(`❌ Campo "${campo}" não encontrado no perfil.`);
    console.log(`   Campos disponíveis: ${Object.keys(profile).join(', ')}`);
    process.exit(1);
  }

  if (typeof profile[campo] !== 'string') {
    console.error(`❌ O campo "${campo}" não é do tipo string. Use --acao para campos de lista.`);
    process.exit(1);
  }

  const valorAnterior = profile[campo];
  profile[campo] = valor;

  saveProfile(profile, campo, valorAnterior, valor);
  console.log(`✅ Campo "${campo}" atualizado com sucesso.`);
  console.log(`   Anterior: ${valorAnterior}`);
  console.log(`   Novo:     ${valor}`);
}

/**
 * Adiciona um item a um campo de lista (array de strings).
 */
function addToArrayField(campo, valor) {
  const profile = loadProfile();

  if (!(campo in profile)) {
    console.error(`❌ Campo "${campo}" não encontrado no perfil.`);
    process.exit(1);
  }

  if (!Array.isArray(profile[campo])) {
    console.error(`❌ O campo "${campo}" não é uma lista. Use --valor diretamente.`);
    process.exit(1);
  }

  // Para arrays de objetos (decisoes_recentes), tratar diferente
  if (campo === 'decisoes_recentes') {
    console.error('❌ Para decisões, use: node src/updateProfile.js --decisao "descrição" --contexto "contexto"');
    process.exit(1);
  }

  if (profile[campo].includes(valor)) {
    console.log(`⚠️  O valor "${valor}" já existe em "${campo}".`);
    return;
  }

  const valorAnterior = [...profile[campo]];
  profile[campo].push(valor);

  saveProfile(profile, campo, valorAnterior, profile[campo]);
  console.log(`✅ Adicionado "${valor}" ao campo "${campo}".`);
  console.log(`   Lista atual: ${profile[campo].join(', ')}`);
}

/**
 * Remove um item de um campo de lista (array de strings).
 */
function removeFromArrayField(campo, valor) {
  const profile = loadProfile();

  if (!Array.isArray(profile[campo])) {
    console.error(`❌ O campo "${campo}" não é uma lista.`);
    process.exit(1);
  }

  const index = profile[campo].indexOf(valor);
  if (index === -1) {
    console.log(`⚠️  O valor "${valor}" não foi encontrado em "${campo}".`);
    return;
  }

  const valorAnterior = [...profile[campo]];
  profile[campo].splice(index, 1);

  saveProfile(profile, campo, valorAnterior, profile[campo]);
  console.log(`✅ Removido "${valor}" do campo "${campo}".`);
}

/**
 * Registra uma nova decisão no perfil.
 */
function addDecision(descricao, contexto) {
  const profile = loadProfile();

  if (!Array.isArray(profile.decisoes_recentes)) {
    profile.decisoes_recentes = [];
  }

  const decisao = {
    data: new Date().toISOString(),
    descricao: descricao,
    contexto: contexto || '',
    resultado: '', // será preenchido posteriormente
  };

  profile.decisoes_recentes.push(decisao);

  saveProfile(profile, 'decisoes_recentes', 'nova entrada', decisao);
  console.log(`✅ Decisão registrada com sucesso!`);
  console.log(`   📋 "${descricao}"`);
  console.log(`   📅 ${decisao.data}`);
}

/**
 * Exibe o perfil atual formatado.
 */
function showProfile() {
  const profile = loadProfile();
  console.log('\n🔮 ════════════════════════════════════════════════════');
  console.log('   ORÁCULO DE IDENTIDADE — Perfil Atual');
  console.log('   ════════════════════════════════════════════════════\n');
  console.log(`   👤 Nome: ${profile.nome}`);
  console.log(`   📌 Versão: ${profile.version}`);
  console.log(`   🕐 Última Atualização: ${profile.ultima_atualizacao}\n`);

  console.log('   🎯 Interesses:');
  (profile.interesses || []).forEach(i => console.log(`      • ${i}`));

  console.log('\n   💎 Valores Pessoais:');
  (profile.valores_pessoais || []).forEach(v => console.log(`      • ${v}`));

  console.log('\n   💪 Pontos Fortes:');
  (profile.pontos_fortes || []).forEach(p => console.log(`      • ${p}`));

  console.log('\n   🔧 Pontos Fracos:');
  const fracos = profile.pontos_fracos || [];
  if (fracos.length === 0) console.log('      (nenhum registrado)');
  else fracos.forEach(p => console.log(`      • ${p}`));

  console.log(`\n   🗣️  Estilo de Comunicação: ${profile.estilo_comunicacao || '(não definido)'}`);
  console.log(`   🎓 Estilo de Aprendizagem: ${profile.estilo_aprendizagem}`);
  console.log(`   😊 Humor Recente: ${profile.humor_recente}`);
  console.log(`\n   🏆 Meta Profissional:`);
  console.log(`      ${profile.metas_profissionais}`);

  console.log('\n   📜 Histórico de Tarefas:');
  (profile.historico_tarefas_relevantes || []).forEach(t => console.log(`      • ${t}`));

  console.log('\n   📊 Decisões Recentes:');
  const decisoes = profile.decisoes_recentes || [];
  if (decisoes.length === 0) console.log('      (nenhuma registrada)');
  else decisoes.forEach(d => console.log(`      • [${d.data}] ${d.descricao}`));

  console.log('\n   ════════════════════════════════════════════════════\n');
}

/**
 * Exibe a ajuda de uso.
 */
function showHelp() {
  console.log(`
🔮 Oráculo de Identidade — Atualização de Perfil
═══════════════════════════════════════════════════

Uso:
  node src/updateProfile.js [opções]

Opções:
  --mostrar                              Exibe o perfil atual formatado
  --campo <nome> --valor <texto>         Atualiza um campo de texto
  --campo <nome> --adicionar <texto>     Adiciona um item a uma lista
  --campo <nome> --remover <texto>       Remove um item de uma lista
  --decisao <descrição> [--contexto <c>] Registra uma nova decisão
  --ajuda                                Exibe esta ajuda

Exemplos:
  node src/updateProfile.js --mostrar
  node src/updateProfile.js --campo humor_recente --valor "ansioso com prazos"
  node src/updateProfile.js --campo interesses --adicionar "machine learning"
  node src/updateProfile.js --campo interesses --remover "esportes"
  node src/updateProfile.js --decisao "Decidi focar em Rust" --contexto "Performance é prioridade"

Campos de texto:
  nome, metas_profissionais, estilo_aprendizagem, humor_recente, estilo_comunicacao

Campos de lista:
  interesses, valores_pessoais, pontos_fortes, pontos_fracos, historico_tarefas_relevantes
`);
}

// ════════════════════════════════════════════════════
// CLI Parser
// ════════════════════════════════════════════════════

function parseArgs(args) {
  const parsed = {};
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      // Flags sem valor
      if (key === 'mostrar' || key === 'ajuda') {
        parsed[key] = true;
        i++;
        continue;
      }
      // Argumentos com valor
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        parsed[key] = args[i + 1];
        i += 2;
      } else {
        parsed[key] = true;
        i++;
      }
    } else {
      i++;
    }
  }
  return parsed;
}

// Execução principal
if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));

  if (Object.keys(args).length === 0 || args.ajuda) {
    showHelp();
    process.exit(0);
  }

  if (args.mostrar) {
    showProfile();
    process.exit(0);
  }

  if (args.decisao) {
    addDecision(args.decisao, args.contexto || '');
    process.exit(0);
  }

  if (args.campo && args.valor) {
    updateStringField(args.campo, args.valor);
    process.exit(0);
  }

  if (args.campo && args.adicionar) {
    addToArrayField(args.campo, args.adicionar);
    process.exit(0);
  }

  if (args.campo && args.remover) {
    removeFromArrayField(args.campo, args.remover);
    process.exit(0);
  }

  console.error('❌ Combinação de argumentos inválida. Use --ajuda para ver o manual.');
  process.exit(1);
}

module.exports = { loadProfile, updateStringField, addToArrayField, removeFromArrayField, addDecision, showProfile };
