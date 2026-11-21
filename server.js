const http = require('http');
const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const { getKey, invalidateKey } = require('./getKey');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const PORT = Number(process.env.PORT || 3000);
const runPowerShell = promisify(execFile);
const POWERSHELL = 'C:\\Users\\zhuwe\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\native\\powershell\\pwsh.exe';

const brief = fs.readFileSync(path.join(ROOT, 'BRIEF.md'), 'utf8');
const notes = fs.readFileSync(path.join(ROOT, 'NOTES.md'), 'utf8');
const model = notes.match(/`(gpt[^`]+)`/)?.[1] || 'gpt-5.6-luna';

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function safeResponse(message) {
  return {
    pick: [],
    chart: [{ food: 'Try a balanced plate', role: 'Include a protein, grain, fruit or vegetable, and water or milk when available.' }],
    reasons: [],
    note: message
  };
}

async function postJson(url, key, body) {
  const script = "$headers=@{Authorization=\"Bearer $env:OPENAI_API_KEY\"}; try { $result=Invoke-WebRequest -Uri $env:FUEL_URL -Method Post -Headers $headers -ContentType 'application/json' -Body $env:FUEL_BODY -ErrorAction Stop; Write-Output ([int]$result.StatusCode); Write-Output $result.Content } catch { if ($_.Exception.Response) { Write-Output ([int]$_.Exception.Response.StatusCode); Write-Output $_.ErrorDetails.Message }; exit 1 }";
  try {
    const result = await runPowerShell(POWERSHELL, ['-NoProfile', '-NonInteractive', '-Command', script], { cwd: ROOT, env: { ...process.env, OPENAI_API_KEY: key, FUEL_URL: url, FUEL_BODY: body }, windowsHide: true });
    const lines = result.stdout.trim().split(/\r?\n/);
    const status = Number(lines.shift());
    return { ok: status >= 200 && status < 300, status, text: lines.join('\n') };
  } catch (error) {
    console.error('OpenAI transport failed:', error.stderr || error.stdout || error.message);
    return { ok: false, status: 0, text: '' };
  }
}

function requestError(message, fix) {
  const error = new Error(message);
  error.fix = fix;
  return error;
}

async function askOpenAI(input) {
  let key = await getKey();

  const system = `${brief}\n\nSafety rules for this app:\n- Be truthful and do not invent nutrition or medical facts.\n- Do not give eating-disorder, starvation, fasting, diet-pill, or extreme weight-loss advice.\n- Do not diagnose anyone.\n- Focus on balanced meals, energy for school, and respectful language.\n- If allergies, medical conditions, or serious food worries come up, recommend a parent, doctor, or school nurse.\n- Return only valid JSON with keys: pick (array of food names), chart (array of objects with food and role), reasons (array of objects with food and why), note (short string).`;
  const user = `Today's lunch options: ${input.options.join(', ')}\nPreferences: ${input.preferences || 'none given'}\nBudget: ${input.budget || 'not given'}\n\nChoose a realistic balanced meal only from the listed options when possible. Keep it short and explain how each chosen item can help with energy. Do not promise weight loss.`;

  try {
    let result = await postJson('https://api.openai.com/v1/chat/completions', key, JSON.stringify({
        model,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
      }));
    if (result.status === 401) {
      invalidateKey();
      key = await getKey();
      result = await postJson('https://api.openai.com/v1/chat/completions', key, JSON.stringify({
        model,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
      }));
    }
    if (!result.ok) throw requestError('The AI could not answer right now.', result.status ? `OpenAI returned status ${result.status}. Check the internet connection or MindDo key service.` : 'Check the internet connection and MindDo key service.');
    const data = JSON.parse(result.text);
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw requestError('The AI returned no answer.', 'Check the OpenAI response format.');
    return JSON.parse(content);
  } catch (error) {
    if (!error.fix) error.fix = 'Check the internet connection and server logs.';
    throw error;
  }
}

function serveFile(request, response) {
  const requested = request.url === '/' ? '/index.html' : request.url;
  const safePath = path.normalize(requested).replace(/^([.][.][\\/])+/, '');
  const file = path.join(PUBLIC, safePath);
  if (!file.startsWith(PUBLIC) || !fs.existsSync(file)) {
    response.writeHead(404); response.end('Not found'); return;
  }
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
  response.writeHead(200, { 'Content-Type': `${types[path.extname(file)] || 'text/plain'}; charset=utf-8` });
  response.end(fs.readFileSync(file));
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'POST' && request.url === '/api/check') {
    let body = '';
    request.on('data', (chunk) => { body += chunk; if (body.length > 10000) request.destroy(); });
    request.on('end', async () => {
      try {
        const input = JSON.parse(body);
        const options = Array.isArray(input.options) ? input.options.filter(Boolean).slice(0, 20) : [];
        if (!options.length) return sendJson(response, 400, { error: { message: 'Add at least one lunch option.', fix: 'Enter one or more foods separated by commas.' } });
        sendJson(response, 200, await askOpenAI({ options, preferences: String(input.preferences || '').slice(0, 300), budget: String(input.budget || '').slice(0, 100) }));
      } catch (error) {
        console.error('Request fix:', error.fix || 'Check the server logs.');
        sendJson(response, 502, { error: { message: error.message || 'I could not answer right now.', fix: error.fix || 'Check the server logs.' } });
      }
    });
    return;
  }
  serveFile(request, response);
});

server.listen(PORT, () => console.log(`FuelSmart is running at http://localhost:${PORT}`));
