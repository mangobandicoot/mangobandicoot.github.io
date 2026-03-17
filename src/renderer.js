/* ─── UI HELPERS & RENDERER ────────────────────────────────────────── */

// The 'h' helper for building elements (Your core UI engine)
function h(tag, props, ...children) {
  const el = document.createElement(tag);
  if (props) {
    for (const key in props) {
      if (key === 'style') Object.assign(el.style, props[key]);
      else if (key === 'className') el.className = props[key];
      else if (key.startsWith('on') && typeof props[key] === 'function') {
        el.addEventListener(key.substring(2).toLowerCase(), props[key]);
      } else el.setAttribute(key, props[key]);
    }
  }
  children.flat().forEach(child => {
    if (!child && child !== 0) return;
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(child));
    } else el.appendChild(child);
  });
  return el;
}

function mkBtn(txt, cls, onClick) {
  return h('button', { className: cls, onClick }, txt);
}

// Modal System
function openModal(content) {
  const m = document.getElementById('modal-overlay');
  const c = document.getElementById('modal-content');
  c.innerHTML = '';
  c.appendChild(content);
  m.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

// Screen Management
function showTab(tabId) {
  const main = document.getElementById('main-content');
  main.innerHTML = '';
  updateHeader();

  if (tabId === 'dashboard') renderDashboard(main);
  if (tabId === 'race') renderRaceMenu(main);
  if (tabId === 'garage') renderGarage(main);
  if (tabId === 'stats') renderStats(main);
}

function updateHeader() {
  document.getElementById('header-name').innerText = G.name;
  document.getElementById('header-bank').innerText = `$${G.bank.toLocaleString()}`;
  document.getElementById('header-fans').innerText = G.fans.toLocaleString();
  document.getElementById('header-tier').innerText = DATA.TIERS[G.tier].name;
}

// (Rest of your specific render functions like renderDashboard, renderRaceBeat, etc. go here)
