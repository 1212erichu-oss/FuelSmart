const fs = require('fs');
const path = require('path');
const { getKey, invalidateKey } = require('./getKey');

const brief = fs.readFileSync(path.join(__dirname, 'BRIEF.md'), 'utf8');
const notes = fs.readFileSync(path.join(__dirname, 'NOTES.md'), 'utf8');
const model = notes.match(/`(gpt[^`]+)`/)?.[1] || 'gpt-5.6-luna';

function requestError(message, fix) {
  const error = new Error(message);
  error.fix = fix;
  return error;
}

function messagesFor(input) {
  const system = `${brief}\n\nSafety rules for this app:\n- Be truthful and do not invent nutrition or medical facts.\n- Do not give eating-disorder, starvation, fasting, diet-pill, or extreme weight-loss advice.\n- Do not diagnose anyone.\n- Focus on balanced meals, energy for school, and respectful language.\n- If allergies, medical conditions, or serious food worries come up, recommend a parent, doctor, or school nurse.\n- Return only valid JSON with keys: pick (array of food names), chart (array of objects with food and role), reasons (array of objects with food and why), note (short string).`;
  const user = `Today's lunch options: ${input.options.join(', ')}\nPreferences: ${input.preferences || 'none given'}\nBudget: ${input.budget || 'not given'}\n\nChoose a realistic balanced meal only from the listed options when possible. Keep it short and explain how each chosen item can help with energy. Do not promise weight loss.`;
  return [{ role: 'system', content: system }, { role: 'user', content: user }];
}

async function sendToOpenAI(key, messages) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, response_format: { type: 'json_object' }, messages })
  });
  let data = {};
  try { data = await response.json(); } catch {}
  return { response, data };
}

async function askOpenAI(input) {
  let key = await getKey();
  let result = await sendToOpenAI(key, messagesFor(input));
  if (result.response.status === 401) {
    invalidateKey();
    key = await getKey();
    result = await sendToOpenAI(key, messagesFor(input));
  }
  if (!result.response.ok) {
    throw requestError(result.data.error?.message || 'The AI could not answer right now.', result.data.error?.fix || 'Check the internet connection or MindDo key service.');
  }
  const content = result.data.choices?.[0]?.message?.content;
  if (!content) throw requestError('The AI returned no answer.', 'Check the OpenAI response format.');
  try { return JSON.parse(content); } catch { throw requestError('The AI returned an unreadable answer.', 'Check the OpenAI response format.'); }
}

module.exports = { askOpenAI };
