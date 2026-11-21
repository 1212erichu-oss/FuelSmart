const fs = require('fs');
const path = require('path');

let cached = null;

function readSettings() {
  const file = path.join(__dirname, '.env');
  const values = { KEYGEN_URL: process.env.KEYGEN_URL, KEYGEN_TOKEN: process.env.KEYGEN_TOKEN };
  if (values.KEYGEN_URL && values.KEYGEN_TOKEN) return values;
  if (!fs.existsSync(file)) return values;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    values[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
  }
  return values;
}

function keyError(message, fix) {
  const error = new Error(message);
  error.fix = fix;
  return error;
}

async function lookupKey() {
  const settings = readSettings();
  if (!settings.KEYGEN_URL || settings.KEYGEN_URL === 'paste-here' || !settings.KEYGEN_TOKEN || settings.KEYGEN_TOKEN === 'paste-here') {
    throw keyError('MindDo key lookup is not configured.', 'Add the MindDo URL and token to .env.');
  }
  const response = await fetch(`${settings.KEYGEN_URL.replace(/\/$/, '')}/api/lookup-key`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${settings.KEYGEN_TOKEN}` }
  });
  let data = {};
  try { data = await response.json(); } catch {}
  if (!response.ok) throw keyError(data.error?.message || 'MindDo could not provide an AI key.', data.error?.fix || 'Check the MindDo URL and token.');
  if (!data.apiKey || !data.expiresAt) throw keyError('MindDo returned an incomplete key response.', 'Ask MindDo for a response with apiKey and expiresAt.');
  const expiresAt = new Date(data.expiresAt).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) throw keyError('MindDo returned an expired AI key.', 'Ask MindDo for a current key.');
  cached = { apiKey: data.apiKey, expiresAt };
  return cached.apiKey;
}

async function getKey() {
  if (cached && cached.expiresAt > Date.now()) return cached.apiKey;
  return lookupKey();
}

function invalidateKey() { cached = null; }

module.exports = { getKey, invalidateKey };
