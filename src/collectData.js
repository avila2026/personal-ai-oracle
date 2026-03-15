// personal-ai-oracle/src/collectData.js
const fs = require('fs');
const path = require('path');

async function collectInitialData() {
  console.log('⚡ Coletando dados iniciais para o perfil do usuário (v2.0)...');

  // Dados de exemplo para o perfil do Jean Carlos — Schema v2
  const initialProfileData = {
    version: '2.0.0',
    ultima_atualizacao: new Date().toISOString(),
    nome: 'Jean Carlos',
    interesses: ['automação', 'desenvolvimento de software', 'inteligência artificial', 'empreendedorismo'],
    valores_pessoais: ['autonomia', 'inovação', 'aprendizado contínuo'],
    pontos_fortes: ['resolução de problemas técnicos', 'autodidatismo', 'execução rápida de projetos'],
    pontos_fracos: [],
    estilo_comunicacao: 'direto e prático, prefere exemplos reais',
    metas_profissionais: 'Lançar uma startup de automação com IA em até 6 meses e escalar o negócio rapidamente.',
    estilo_aprendizagem: 'prático, baseado em projetos e experimentação',
    humor_recente: 'motivado, focado e com energia para construir projetos inovadores',
    historico_tarefas_relevantes: [
      'Instalação e configuração do OpenClaw em VPS Hostinger.',
      'Configuração de integração com GitHub (SSH e gh CLI).',
      'Instalação do Ollama e Qwen 2.5 7B localmente.',
      'Desenvolvimento de skill para monitor de tendências de vendas (CSV + Ollama).',
      'Elaboração da visão do projeto Oráculo de Identidade para Agentes de IA.',
    ],
    decisoes_recentes: [],
  };

  const dataDirPath = path.join(__dirname, '..', 'data');
  const profileFilePath = path.join(dataDirPath, 'user_profile.json');

  try {
    // Cria a pasta data se não existir
    if (!fs.existsSync(dataDirPath)) {
      fs.mkdirSync(dataDirPath, { recursive: true });
    }

    fs.writeFileSync(profileFilePath, JSON.stringify(initialProfileData, null, 2), 'utf8');
    console.log(`✅ Perfil inicial do usuário (v2.0) criado em: ${profileFilePath}`);
    return initialProfileData;
  } catch (error) {
    console.error('Erro ao coletar ou salvar dados do perfil:', error.message);
    throw error;
  }
}

// Para execução direta via Node.js
if (require.main === module) {
  collectInitialData().catch(console.error);
}

module.exports = { collectInitialData };