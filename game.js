/* ─── CORE GAME LOGIC ──────────────────────────────────────────────── */

let G = null;
const DATA = GAME_DATA; // Connects to data.js

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

async function loadGame() {
  const saved = localStorage.getItem('ft_rpg_save');
  if (saved) {
    G = JSON.parse(saved);
    return true;
  }
  return false;
}

function saveGame() {
  localStorage.setItem('ft_rpg_save', JSON.stringify(G));
}

function initGame(name, num, state) {
  G = {
    name, num, state,
    bank: 5000, fans: 0, rep: 50, tier: 0,
    stats: { speed: 10, craft: 10, consistency: 10 },
    history: [],
    inventory: [],
    season: { racesDone: 0, points: 0, wins: 0, top5s: 0 },
    contract: null,
    currentRace: null
  };
}

// The BitLife-style Race Calculation
function startRaceSession(track) {
  G.currentRace = {
    track: track,
    pos: rand(20, 35),
    beatsRemaining: 5,
    log: [],
    startPos: 0
  };
  G.currentRace.startPos = G.currentRace.pos;
  renderRaceBeat(); // Found in renderer.js
}

function processBeatChoice(choiceIndex, event) {
  const choice = event.choices[choiceIndex];
  const roll = rand(1, 20);
  const skill = G.stats[event.stat] || 10;
  const total = roll + skill;
  const success = total >= choice.threshold;

  const result = success ? choice.onSuccess : choice.onFailure;
  G.currentRace.pos = clamp(G.currentRace.pos + result.move, 1, 40);
  
  if (result.rep) G.rep = clamp(G.rep + result.rep, 0, 100);
  
  G.currentRace.beatsRemaining--;
  if (G.currentRace.beatsRemaining <= 0) finishRace();
  else renderRaceBeat();
}
function finishRace() {
  const race = G.currentRace;
  const pos = race.pos;
  
  // BitLife-style Payout Math
  let prize = Math.max(0, (40 - pos) * 150);
  if (pos === 1) prize += 2000;
  if (pos <= 5) G.season.top5s++;
  
  G.bank += prize;
  G.season.racesDone++;
  
  const logEntry = `P${pos} at ${race.track.name} (+$${prize})`;
  G.history.push(logEntry);
  
  // Check for Tier Up
  if (G.season.racesDone >= 5 && G.tier < DATA.TIERS.length - 1) {
    G.tier++;
    G.season.racesDone = 0;
    alert(`Level Up! You've been promoted to ${DATA.TIERS[G.tier].name}!`);
  }

  G.currentRace = null;
  saveGame();
  
  // Show Result Modal
  openModal(h('div', null,
    h('h2', { style: { color: '#D97706' } }, pos === 1 ? 'VICTORY!' : 'Race Finished'),
    h('p', { style: { margin: '15px 0' } }, `You finished P${pos}. Earnings: $${prize.toLocaleString()}`),
    mkBtn('Return to Hub', 'btn-primary', () => {
      closeModal();
      showTab('dashboard');
    })
  ));
}

// Setup handler for index.html
function handleStart() {
  const name = document.getElementById('setup-name').value;
  if (!name) return alert("Enter a name!");
  initGame(name, "00", "USA");
  saveGame();
  document.getElementById('setup').classList.add('hidden');
  document.getElementById('app').style.display = 'flex';
  showTab('dashboard');
}
