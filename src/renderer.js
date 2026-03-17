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
function renderDashboard(container) {
  container.appendChild(h('div', { className: 'card' },
    h('div', { className: 'card-header' }, 'Next Race'),
    h('p', { style: { fontSize: '20px', fontWeight: '800' } }, DATA.TIERS[G.tier].name),
    mkBtn('Go to Race Menu →', 'btn-primary', () => showTab('race'))
  ));

  if (G.history.length > 0) {
    const last = G.history[G.history.length - 1];
    container.appendChild(h('div', { className: 'card' },
      h('div', { className: 'card-header' }, 'Last Result'),
      h('p', null, last)
    ));
  }
}

function renderRaceMenu(container) {
  const tier = DATA.TIERS[G.tier];
  container.appendChild(h('h2', { style: { marginBottom: '16px' } }, `${tier.name} Schedule`));
  
  tier.tracks.forEach(tName => {
    const track = DATA.TRACKS.find(t => t.name === tName);
    container.appendChild(h('div', { className: 'card', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
      h('div', null, 
        h('div', { style: { fontWeight: '700' } }, track.name),
        h('div', { style: { fontSize: '12px', color: '#94A3B8' } }, track.type)
      ),
      mkBtn('Race', 'btn-primary', () => startRaceSession(track))
    ));
  });
}

function renderRaceBeat() {
  const main = document.getElementById('main-content');
  main.innerHTML = '';
  const race = G.currentRace;
  const event = DATA.BEAT_EVENTS[rand(0, DATA.BEAT_EVENTS.length - 1)];

  main.appendChild(h('div', { className: 'beat-card' },
    h('div', { className: 'card-header' }, `POS: P${race.pos} | ${race.beatsRemaining} Laps Left`),
    h('h2', { style: { margin: '10px 0' } }, event.title),
    h('p', { style: { marginBottom: '20px', color: '#CBD5E1' } }, event.desc),
    event.choices.map((choice, idx) => 
      h('button', { 
        className: 'btn-choice', 
        onClick: () => processBeatChoice(idx, event) 
      }, [
        h('div', { style: { fontWeight: '700' } }, choice.text),
        h('div', { style: { fontSize: '12px', opacity: '0.7' } }, `Check: ${event.stat.toUpperCase()} (Difficulty: ${choice.threshold})`)
      ])
    )
  ));
}
