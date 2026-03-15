// personal-ai-oracle/src/memory/addMemory.js
const { addMemory, searchMemories } = require('./vectorStore');

function showHelp() {
  console.log(`
🔮 Oráculo de Identidade — Memória de Longo Prazo
═══════════════════════════════════════════════════

Uso:
  node src/memory/addMemory.js [opções]

Opções:
  --texto <"texto da memória">      O que você deseja que o Oráculo lembre
  --categoria <"categoria">         Opcional: agrupar memórias (ex: "trabalho", "pessoal")
  --buscar <"termo">                Testar a busca semântica no banco
  --ajuda                           Exibe esta ajuda

Exemplos:
  node src/memory/addMemory.js --texto "Não gosto de reuniões antes das 10h" --categoria "preferencia"
  node src/memory/addMemory.js --buscar "Que horas gosto de trabalhar?"
`);
}

function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      if (args[i + 1] && !args[i + 1].startsWith('--')) {
        parsed[key] = args[i + 1];
        i++;
      } else {
        parsed[key] = true;
      }
    }
  }
  return parsed;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (Object.keys(args).length === 0 || args.ajuda) {
    showHelp();
    return;
  }

  try {
    if (args.texto) {
      console.log('🧠 Injetando memória no ChromaDB...');
      const category = args.categoria || "geral";
      const result = await addMemory(args.texto, category);
      
      console.log('✅ Memória salva!');
      console.log(`   ID: ${result.id}`);
      console.log(`   Texto: "${result.text}"`);
      console.log(`   Categoria: ${result.category}`);
      return;
    }

    if (args.buscar) {
      console.log(`🔍 Buscando memórias referentes a: "${args.buscar}"...`);
      const results = await searchMemories(args.buscar);
      
      if (results.length === 0) {
        console.log('   (Nenhuma memória encontrada)');
      } else {
        console.log(`\n📚 Encontradas ${results.length} memória(s):`);
        results.forEach((mem, idx) => {
          console.log(`   [${idx+1}] Distância: ${mem.distancia.toFixed(4)} | Cat: ${mem.metadados.category}`);
          console.log(`       "${mem.documento}"\n`);
        });
      }
      return;
    }

  } catch (error) {
    console.error('❌ Ocorreu um erro. Verifique se o ChromaDB está rodando localmente na porta 8000 e se o Ollama está ativo.');
    console.error(`Detalhes: ${error.message}`);
  }
}

if (require.main === module) {
  main();
}
