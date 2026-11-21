const http = require('http');
const fs = require('fs');
const path = require('path');
const { askOpenAI } = require('./ai-client');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const PORT = Number(process.env.PORT || 3000);

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function serveFile(request, response) {
  const requested = request.url === '/' ? '/index.html' : request.url;
  const safePath = path.normalize(requested).replace(/^([.][.][\\/])+/, '');
  const file = path.join(PUBLIC, safePath);
  if (!file.startsWith(PUBLIC) || !fs.existsSync(file)) { response.writeHead(404); response.end('Not found'); return; }
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
  response.writeHead(200, { 'Content-Type': `${types[path.extname(file)] || 'text/plain'}; charset=utf-8` });
  response.end(fs.readFileSync(file));
}

const server = http.createServer((request, response) => {
  if (request.method === 'POST' && request.url === '/api/check') {
    let body = '';
    request.on('data', (chunk) => { body += chunk; if (body.length > 10000) request.destroy(); });
    request.on('end', async () => {
      try {
        const input = JSON.parse(body);
        const options = Array.isArray(input.options) ? input.options.filter(Boolean).slice(0, 20) : [];
        if (!options.length) return sendJson(response, 400, { error: { message: 'Add at least one lunch option.', fix: 'Enter one or more foods separated by commas.' } });
        const answer = await askOpenAI({ options, preferences: String(input.preferences || '').slice(0, 300), budget: String(input.budget || '').slice(0, 100) });
        sendJson(response, 200, answer);
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
