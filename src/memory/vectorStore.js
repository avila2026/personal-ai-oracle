// personal-ai-oracle/src/memory/vectorStore.js
const fs = require('fs');
const path = require('path');

const memoryFilePath = path.join(__dirname, '..', '..', 'data', 'vector_memory.json');

/**
 * Retorna as memórias persistidas. A estrutura do JSON é:
 * [
 *   {
 *     id: 'mem-123456789',
 *     text: 'adoro café',
 *     category: 'preferencia',
 *     timestamp: '2026-03-15T...',
 *     embedding: [0.1, 0.4, -0.2, ...]
 *   }
 * ]
 */
function loadMemories() {
  if (!fs.existsSync(memoryFilePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(memoryFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('❌ Falha ao ler vector_memory.json', err);
    return [];
  }
}

function saveMemories(memories) {
  const dir = path.dirname(memoryFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(memoryFilePath, JSON.stringify(memories, null, 2), 'utf8');
}

/**
 * Calcula a similaridade por cosseno entre dois vetores.
 * Retorna um valor entre -1 e 1 (1 = extremamente similar).
 */
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Gera um embedding numérico chamando a API do Ollama.
 * Por padrão usa o modelo qwen2.5:0.5b (suporta embeddings),
 * mas para uso dedicado recomendam 'nomic-embed-text'.
 */
async function generateEmbedding(text, model = 'qwen2.5:0.5b') {
  try {
    const response = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        prompt: text
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  } catch (err) {
    console.error("❌ Falha ao gerar embedding com Ollama. O Ollama está rodando?", err.message);
    throw err;
  }
}

/**
 * Adiciona uma memória ao vetor local.
 */
async function addMemory(text, category = "geral") {
  // 1. Gera o embedding
  const embedding = await generateEmbedding(text);
  
  // 2. Adiciona à base local
  const memories = loadMemories();
  const newMemory = {
    id: `mem-${Date.now()}`,
    documento: text,
    metadados: {
      category: category,
      timestamp: new Date().toISOString()
    },
    embedding: embedding
  };
  
  memories.push(newMemory);
  saveMemories(memories);
  
  return { 
    id: newMemory.id, 
    text: newMemory.documento, 
    category: newMemory.metadados.category 
  };
}

/**
 * Busca memórias similares a uma query.
 */
async function searchMemories(queryStr, nResults = 3) {
  const memories = loadMemories();
  if (memories.length === 0) return [];

  // 1. Gera o embedding da pergunta
  const queryEmbedding = await generateEmbedding(queryStr);
  
  // 2. Compara a similaridade de cosseno com cada memória
  const scoredMemories = memories.map(mem => {
    const similarity = cosineSimilarity(queryEmbedding, mem.embedding);
    // Clonamos o objeto excluindo o vetor pesado para não entupir a resposta
    return {
      id: mem.id,
      documento: mem.documento,
      metadados: mem.metadados,
      distancia: 1 - similarity // Convertendo similaridade em distância (0 = idêntico) para compatibilidade visual
    };
  });
  
  // 3. Ordena pela maior similaridade (menor distância) e pega os 'nResults'
  scoredMemories.sort((a, b) => a.distancia - b.distancia);
  
  return scoredMemories.slice(0, nResults);
}

module.exports = {
  addMemory,
  searchMemories,
  generateEmbedding
};
