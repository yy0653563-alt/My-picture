const RESULT_MAX = 20;
const HISTORY_KEY = 'my-picture-history';

const form = document.getElementById('generate-form');
const promptInput = document.getElementById('prompt');
const sizeSelect = document.getElementById('size');
const countSelect = document.getElementById('count');
const generateBtn = document.getElementById('generate-btn');
const btnText = generateBtn.querySelector('.btn-text');
const btnLoader = generateBtn.querySelector('.btn-loader');
const resultsGrid = document.getElementById('results');
const resultsTitle = document.getElementById('results-title');
const errorBox = document.getElementById('error-box');
const historyGrid = document.getElementById('history');
const historyEmpty = document.getElementById('history-empty');
const clearHistoryBtn = document.getElementById('clear-history');

function buildUrl(prompt, width, height, seed) {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
}

function imageCard(item) {
  const card = document.createElement('figure');
  card.className = 'image-card';

  const img = document.createElement('img');
  img.loading = 'lazy';
  img.alt = item.prompt;
  img.src = item.url;

  const skeleton = document.createElement('div');
  skeleton.className = 'skeleton';
  card.appendChild(skeleton);
  img.addEventListener('load', () => skeleton.remove());
  img.addEventListener('error', () => {
    skeleton.remove();
    card.classList.add('failed');
    const msg = document.createElement('div');
    msg.className = 'failed-msg';
    msg.textContent = 'تعذّر تحميل الصورة';
    card.appendChild(msg);
  });

  const caption = document.createElement('figcaption');
  caption.textContent = item.prompt;

  const actions = document.createElement('div');
  actions.className = 'actions';

  const open = document.createElement('a');
  open.href = item.url;
  open.target = '_blank';
  open.rel = 'noopener';
  open.textContent = '🔎 عرض كامل';

  const download = document.createElement('a');
  download.href = item.url;
  download.download = `my-picture-${Date.now()}.jpg`;
  download.textContent = '⬇️ تحميل';

  actions.appendChild(open);
  actions.appendChild(download);
  caption.appendChild(actions);

  card.appendChild(img);
  card.appendChild(caption);
  return card;
}

function configureGrid(grid, sizeValue) {
  grid.classList.remove('landscape');
  if (parseSize(sizeValue).ratio > 1) grid.classList.add('landscape');
}

function parseSize(sizeValue) {
  const [w, h] = sizeValue.split('x').map(Number);
  return { width: w, height: h, ratio: w / h };
}

function renderHistory() {
  historyGrid.innerHTML = '';
  let items = [];
  try {
    items = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    items = [];
  }
  historyEmpty.hidden = items.length > 0;
  clearHistoryBtn.hidden = items.length === 0;
  items.forEach(item => historyGrid.appendChild(imageCard(item)));
}

function saveToHistory(items) {
  let stored = [];
  try {
    stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    stored = [];
  }
  const merged = [...items, ...stored].slice(0, RESULT_MAX);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(merged));
  renderHistory();
}

function setLoading(loading) {
  generateBtn.disabled = loading;
  btnText.hidden = loading;
  btnLoader.hidden = !loading;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  errorBox.hidden = true;
  resultsGrid.innerHTML = '';

  const prompt = promptInput.value.trim();
  if (!prompt) {
    showError('الرجاء كتابة وصف للصورة أولاً.');
    return;
  }

  const sizeValue = sizeSelect.value;
  const { width, height, ratio } = parseSize(sizeValue);
  const count = Number(countSelect.value);
  const sizeClass = ratio > 1 ? 'landscape' : 'square';

  resultsTitle.hidden = false;
  configureGrid(resultsGrid, sizeValue);

  const generated = [];
  for (let i = 0; i < count; i++) {
    const item = {
      prompt,
      url: buildUrl(prompt, width, height, Math.floor(Math.random() * 1e9)),
      seed: Date.now() + i,
    };
    resultsGrid.appendChild(imageCard(item));
    generated.push(item);
  }

  saveToHistory(generated);
});

clearHistoryBtn.addEventListener('click', () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
});

renderHistory();
