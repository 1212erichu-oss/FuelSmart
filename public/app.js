const $ = (selector) => document.querySelector(selector);
const saved = FuelStorage.read();

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));
}

function renderPlate() {
  const groups = new Set(saved.plate.map((food) => food.group));
  const needed = ['protein', 'grain', 'fruit', 'vegetable', 'dairy'];
  $('#plate-list').innerHTML = saved.plate.length
    ? saved.plate.map((food) => `<li><div><strong>${escapeHtml(food.name)}</strong><p class="food-energy">${escapeHtml(food.energy)}</p></div><small>${escapeHtml(food.group)}</small></li>`).join('')
    : '<li class="muted">No foods added yet.</li>';
  $('#plate-status').innerHTML = needed.map((group) => `<span class="${groups.has(group) ? 'done' : ''}">${groups.has(group) ? '✓' : '○'} ${group}</span>`).join('');
  $('#plate-message').textContent = groups.size >= 3 ? 'Nice start. Add more groups when they are available.' : 'Try to include at least three different food groups.';
}

function renderFoodChoices() {
  $('#food-choices').innerHTML = FuelStorage.sample.map((food, index) => `<button class="food-choice" data-index="${index}"><strong>${escapeHtml(food.name)}</strong><span>${escapeHtml(food.energy)}</span></button>`).join('');
  document.querySelectorAll('.food-choice').forEach((button) => button.addEventListener('click', () => {
    const food = FuelStorage.sample[Number(button.dataset.index)];
    if (!saved.plate.some((item) => item.name === food.name)) saved.plate.push(food);
    FuelStorage.write({ plate: saved.plate }); renderPlate();
  }));
}

function showAnswer(answer) {
  const pick = (answer.pick || []).map(escapeHtml).join(', ') || 'See the chart below';
  const chart = (answer.chart || []).map((item) => `<tr><td>${escapeHtml(item.food)}</td><td>${escapeHtml(item.role)}</td></tr>`).join('');
  const reasons = (answer.reasons || []).map((item) => `<li><strong>${escapeHtml(item.food)}:</strong> ${escapeHtml(item.why)}</li>`).join('');
  $('#answer').innerHTML = `<div class="pick"><span>Balanced pick</span><strong>${pick}</strong></div><table><thead><tr><th>Food</th><th>Why it helps</th></tr></thead><tbody>${chart}</tbody></table>${reasons ? `<ul class="reasons">${reasons}</ul>` : ''}<p class="note">${escapeHtml(answer.note || 'Choose what feels right for you. You do not need to skip meals.')}</p>`;
}

$('#check-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = $('#check-button');
  const options = $('#lunch-options').value.split(',').map((item) => item.trim()).filter(Boolean);
  $('#answer').innerHTML = '<div class="thinking">Thinking…</div>';
  button.disabled = true;
  try {
    const response = await fetch('/api/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ options, preferences: $('#preferences').value, budget: $('#budget').value }) });
    const answer = await response.json();
    if (!response.ok) {
      const failure = answer.error || {};
      throw new Error(failure.message || 'Try again.');
    }
    showAnswer(answer);
  } catch (error) { $('#answer').innerHTML = `<p class="error">${escapeHtml(error.message || 'Please try again.')}</p>`; }
  finally { button.disabled = false; }
});

renderFoodChoices();
renderPlate();
