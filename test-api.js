// test-api.js — Script de teste para todos os endpoints da API v2.0
const BASE_URL = 'http://localhost:3000';
const API_KEY = 'super-secret-key-do-chefe';

async function request(method, path, body = null) {
  const headers = { 'X-API-Key': API_KEY };
  const opts = { method, headers };
  if (body) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log('\n🧪 ════════════════════════════════════════════════════');
  console.log('   TESTANDO API DO ORÁCULO v2.0');
  console.log('   ════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      passed++;
      console.log(`   ✅ ${name}`);
    } catch (err) {
      failed++;
      console.log(`   ❌ ${name}: ${err.message}`);
    }
  }

  await test('GET /health — retorna status online', async () => {
    const { status, data } = await request('GET', '/health');
    if (status !== 200) throw new Error(`Status ${status}`);
    if (data.status !== 'online') throw new Error(`Status inesperado: ${data.status}`);
  });

  await test('GET /profile — retorna perfil + insights', async () => {
    const { status, data } = await request('GET', '/profile');
    if (status !== 200) throw new Error(`Status ${status}`);
    if (!data.data.profile.nome) throw new Error('Sem nome no perfil');
  });

  await test('GET /context — retorna contexto prompt-ready', async () => {
    const { status, data } = await request('GET', '/context');
    if (status !== 200) throw new Error(`Status ${status}`);
    if (!data.contexto) throw new Error('Sem contexto gerado');
    if (!data.dados_estruturados) throw new Error('Sem dados estruturados');
  });

  await test('POST /decisions — registra decisão', async () => {
    const { status, data } = await request('POST', '/decisions', {
      descricao: 'Decidi evoluir o Oráculo para v2.0',
      contexto: 'Expandir sistema com novos endpoints e perfil dinâmico',
    });
    if (status !== 201) throw new Error(`Status ${status}, body: ${JSON.stringify(data)}`);
    if (data.status !== 'success') throw new Error(`Resposta: ${data.status}`);
  });

  await test('POST /feedback — registra feedback de agente', async () => {
    const { status, data } = await request('POST', '/feedback', {
      agente: 'Antigravity-Test',
      endpoint_consultado: '/context',
      utilidade: 5,
      comentario: 'Contexto muito útil para personalização',
    });
    if (status !== 201) throw new Error(`Status ${status}, body: ${JSON.stringify(data)}`);
  });

  await test('GET /evolution — retorna changelog', async () => {
    const { status, data } = await request('GET', '/evolution');
    if (status !== 200) throw new Error(`Status ${status}`);
    if (data.data.total_mudancas === undefined) throw new Error('Sem total_mudancas');
  });

  await test('GET /insights/talentos — retorna 404 (ainda não gerado)', async () => {
    const { status } = await request('GET', '/insights/talentos');
    if (status !== 404) throw new Error(`Esperava 404, recebeu ${status}`);
  });

  await test('GET /insights/invalido — retorna 400', async () => {
    const { status } = await request('GET', '/insights/invalido');
    if (status !== 400) throw new Error(`Esperava 400, recebeu ${status}`);
  });

  await test('Sem API Key — retorna 401', async () => {
    const res = await fetch(`${BASE_URL}/profile`);
    if (res.status !== 401) throw new Error(`Esperava 401, recebeu ${res.status}`);
  });

  console.log('\n   ════════════════════════════════════════════════════');
  console.log(`   Resultado: ${passed} ✅ | ${failed} ❌`);
  console.log('   ════════════════════════════════════════════════════\n');
}

runTests().catch(err => {
  console.error('Erro fatal:', err.message);
  process.exit(1);
});
