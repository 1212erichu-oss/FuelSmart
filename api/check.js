const { askOpenAI } = require('../ai-client');

function sendError(res, status, error) {
  console.error('Request fix:', error.fix || 'Check the server logs.');
  return res.status(status).json({ error: { message: error.message || 'I could not answer right now.', fix: error.fix || 'Check the server logs.' } });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return sendError(res, 405, Object.assign(new Error('Use the Check button to send a lunch request.'), { fix: 'Send a POST request to /api/check.' }));
  try {
    const input = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const options = Array.isArray(input.options) ? input.options.filter(Boolean).slice(0, 20) : [];
    if (!options.length) return sendError(res, 400, Object.assign(new Error('Add at least one lunch option.'), { fix: 'Enter one or more foods separated by commas.' }));
    const answer = await askOpenAI({ options, preferences: String(input.preferences || '').slice(0, 300), budget: String(input.budget || '').slice(0, 100) });
    return res.status(200).json(answer);
  } catch (error) {
    return sendError(res, 502, error);
  }
};
