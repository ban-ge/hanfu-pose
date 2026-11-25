const labels = { pose: '姿势', costume: '服装', head: '发型头饰' };
const viewNames = { front: '正面', diag: '斜侧', side: '侧面', back: '背面' };
const state = { items: [], kind: 'pose', era: 'all', gender: 'all', season: 'all', selected: {}, cardAngles: {}, detail: null, angle: 'front' };
const $ = selector => document.querySelector(selector);
const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function renderCards() {
  const list = state.items.filter(item => item.kind === state.kind && (state.era === 'all' || item.era === state.era || item.era === '通用') && (state.gender === 'all' || item.gender === state.gender || item.gender === '通用') && (item.kind !== 'costume' || state.season === 'all' || (item.season || '未标季节') === state.season));
  $('#results').textContent = `${labels[state.kind]} · ${list.length} 组`;
  $('#cards').innerHTML = list.length ? list.map(item => {
    const angle = state.cardAngles[item.id] || 'front';
    const thumbnails = Object.entries(viewNames).filter(([key]) => item.view_files[key]).map(([key, label]) => `<button type="button" class="card-view ${key === angle ? 'active' : ''}" data-card-angle="${key}" aria-label="${escapeHtml(item.name)}：${label}" aria-pressed="${key === angle}"><img src="${item.view_files[key]}" loading="lazy" alt=""><span>${label}</span></button>`).join('');
    return `<article class="card" data-card="${item.id}"><button class="card-image" data-open="${item.id}" aria-label="查看 ${escapeHtml(item.name)} 的详情"><img src="${item.view_files[angle]}" loading="lazy" alt="${escapeHtml(item.name)}${viewNames[angle]}参考图"><span class="card-id">${item.id} / ${item.era}</span></button><div class="card-bottom"><div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.summary)}<br>${item.gender}${item.kind === 'costume' ? ` · ${item.season ? item.season + '季' : '未标季节'}` : ''} · ${item.status}</p></div><button class="card-add" data-select="${item.id}" aria-label="将 ${escapeHtml(item.name)} 加入组合">+</button></div><div class="card-views" role="group" aria-label="${escapeHtml(item.name)}的视角">${thumbnails}</div></article>`;
  }).join('') : '<p class="empty">没有匹配的素材，请更换筛选条件。</p>';
}

function setCardAngle(item, angle) {
  state.cardAngles[item.id] = angle;
  const card = [...document.querySelectorAll('[data-card]')].find(element => element.dataset.card === item.id);
  if (!card) return;
  const image = card.querySelector('.card-image img');
  image.src = item.view_files[angle];
  image.alt = `${item.name}${viewNames[angle]}参考图`;
  card.querySelectorAll('[data-card-angle]').forEach(button => {
    const active = button.dataset.cardAngle === angle;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function selection(item, angle = 'front') {
  state.selected[item.kind] = { item, angle };
  renderSelection();
}

function renderSelection() {
  $('#slots').innerHTML = Object.entries(labels).map(([kind, label], index) => {
    const chosen = state.selected[kind];
    return `<div class="slot">${chosen ? `<img src="${chosen.item.view_files[chosen.angle]}" alt="${escapeHtml(chosen.item.name)}">` : `<span class="number">0${index + 1}</span>`}<div><small>${label} / ${String(index + 1).padStart(2, '0')}</small><b>${chosen ? escapeHtml(chosen.item.name) : `选择一组${label}`}</b>${chosen ? `<a href="${chosen.item.view_files[chosen.angle]}" download>下载${viewNames[chosen.angle]}参考图 ↓</a>` : '<a href="#library">前往图鉴挑选 ↗</a>'}</div></div>`;
  }).join('');
  const { pose, costume, head } = state.selected;
  const warnings = [];
  if (costume && head && costume.item.era !== head.item.era) warnings.push('服装与发型头饰来自不同时期，当前为创意混搭。');
  if (costume && head && costume.item.gender !== head.item.gender) warnings.push('服装与发型头饰的设计对象不同，请按创作意图确认。');
  if (pose?.item.id === 'P001') warnings.push('行走图组各视角步态有差异，建议只使用所选单张参考图。');
  $('#warning').textContent = warnings.join(' ');
  const selected = [pose, costume, head].filter(Boolean);
  if (!selected.length) { $('#prompt').textContent = '在图鉴中选择姿势、服装和发型头饰后，这里会生成组合提示词。'; return; }
  let number = 0;
  const roles = [];
  for (const [kind, chosen] of Object.entries({ pose, costume, head })) {
    if (!chosen) continue;
    number++;
    const intro = kind === 'pose' ? '仅参考姿势和构图' : kind === 'costume' ? '仅参考服装的形制、配色和层次' : '仅参考发型和头饰，不复制参考模特的面容';
    const season = chosen.item.season ? `，${chosen.item.season}季` : '';
    roles.push(`图 ${number}：${labels[kind]} ${chosen.item.id}（${viewNames[chosen.angle]}${season}）；${intro}。${chosen.item.description}`);
  }
  const scene = $('#scene').value.trim();
  $('#prompt').textContent = `${roles.join('\n')}\n\n${scene || '人物与场景：请在此补充。'}\n\n让人物的姿势、衣服与发饰自然融合；保留衣物结构和头饰细节，完整呈现人物。以上造型为时代题材设计，不声称历史复原。`;
}

function setDetailAngle(angle) {
  state.angle = angle;
  const item = state.detail;
  setCardAngle(item, angle);
  $('#detail-img').src = item.view_files[angle];
  $('#detail-img').alt = `${item.name}，${viewNames[angle]}参考图`;
  $('#download').href = item.view_files[angle];
  $('#download').download = `${item.id}-${angle}.png`;
  $('#view-tabs').innerHTML = Object.entries(viewNames).map(([key, label]) => `<button data-angle="${key}" class="${key === angle ? 'active' : ''}" aria-pressed="${key === angle}">${label}</button>`).join('');
}
function openDetail(item) {
  state.detail = item;
  $('#detail-id').textContent = `REFERENCE / ${item.id}`;
  $('#detail-meta').textContent = `${labels[item.kind]} / ${item.era} / ${item.gender}${item.kind === 'costume' ? ` / ${item.season ? item.season + '季' : '未标季节'}` : ''} / ${item.status}`;
  $('#detail-name').textContent = item.name;
  $('#detail-description').textContent = item.description;
  $('#detail-review').textContent = item.review;
  $('#detail-prompt').textContent = item.prompt;
  setDetailAngle(state.cardAngles[item.id] || 'front');
  $('#detail').showModal();
}

for (const button of document.querySelectorAll('[data-kind]')) button.addEventListener('click', () => {
  state.kind = button.dataset.kind;
  $('#season').disabled = state.kind !== 'costume';
  document.querySelectorAll('[data-kind]').forEach(tab => tab.classList.toggle('active', tab === button));
  renderCards();
});
$('#era').addEventListener('change', event => { state.era = event.target.value; renderCards(); });
$('#gender').addEventListener('change', event => { state.gender = event.target.value; renderCards(); });
$('#season').addEventListener('change', event => { state.season = event.target.value; renderCards(); });
$('#cards').addEventListener('click', event => {
  const view = event.target.closest('[data-card-angle]');
  if (view) {
    const item = state.items.find(entry => entry.id === view.closest('[data-card]').dataset.card);
    if (item) setCardAngle(item, view.dataset.cardAngle);
    return;
  }
  const open = event.target.closest('[data-open]');
  const add = event.target.closest('[data-select]');
  const id = open?.dataset.open || add?.dataset.select;
  const item = state.items.find(entry => entry.id === id);
  if (item && open) openDetail(item);
  if (item && add) selection(item, state.cardAngles[item.id] || 'front');
});
$('#view-tabs').addEventListener('click', event => { const button = event.target.closest('[data-angle]'); if (button) setDetailAngle(button.dataset.angle); });
$('#choose').addEventListener('click', () => { selection(state.detail, state.angle); $('#detail').close(); });
$('#close').addEventListener('click', () => $('#detail').close());
$('#detail').addEventListener('click', event => { if (event.target === $('#detail')) $('#detail').close(); });
$('#scene').addEventListener('input', renderSelection);
$('#copy').addEventListener('click', async () => {
  const button = $('#copy');
  try { await navigator.clipboard.writeText($('#prompt').textContent); button.textContent = '已复制 ✓'; }
  catch { button.textContent = '复制失败，请手动选择文字'; }
  setTimeout(() => { button.textContent = '复制提示词 ↗'; }, 2500);
});
fetch('data/catalog.json').then(response => { if (!response.ok) throw new Error('无法读取目录'); return response.json(); }).then(data => {
  state.items = data.items;
  for (const [kind, target] of Object.entries({ pose: '#count-poses', costume: '#count-costumes', head: '#count-heads' })) $(target).textContent = String(data.items.filter(item => item.kind === kind).length).padStart(2, '0');
  renderCards(); renderSelection();
}).catch(() => { $('#results').textContent = '目录加载失败，请按 README 使用本地服务器打开。'; });
