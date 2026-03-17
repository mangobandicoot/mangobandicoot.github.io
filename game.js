// ═══════════════════════════════════════════════════════════════════════════════
// FULL THROTTLE v2.0 — MASTER LOGIC ENGINE (COMPLETE)
// ═══════════════════════════════════════════════════════════════════════════════

let G = null; 
let DATA = null;
let activeTab = 'dashboard';

async function init() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error("Data load failed.");
        DATA = await response.json();
        
        const saved = localStorage.getItem('ft_master_save_v2');
        if (saved) { 
            G = JSON.parse(saved); 
            launchGame(); 
        }
    } catch (e) { 
        console.error("BOOT ERROR:", e);
    }
}

function handleStartCareer() {
    const nameInput = document.getElementById('player-name');
    if (!nameInput || !nameInput.value.trim()) return alert("Driver Name Required!");

    G = {
        name: nameInput.value.trim(),
        money: 1200, wins: 0, rep: 0, tier: 1, sr: 2.50,
        stats: { speed: 5, craft: 5, consistency: 5 },
        car: { condition: 100, setup: { wing: 5, suspension: 5, mapping: 5 } },
        history: [], rivalData: {},
        session: null // Holds current race data
    };

    saveGame();
    launchGame();
}

function launchGame() {
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-app').style.display = 'block';
    switchTab('dashboard');
}

function switchTab(tabId) {
    activeTab = tabId;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.toLowerCase() === tabId);
    });

    // Update Global Headers
    document.getElementById('display-name').innerText = G.name;
    document.getElementById('display-money').innerText = `$${G.money.toLocaleString()}`;
    document.getElementById('display-wins').innerText = G.wins;
    document.getElementById('display-tier').innerText = `Tier ${G.tier} | SR: ${G.sr.toFixed(2)}`;

    const content = document.getElementById('game-content');
    
    // Call renderers from src/renderer.js
    if (tabId === 'dashboard') renderDashboard(content);
    else if (tabId === 'race') renderRaceMenu(content);
    else if (tabId === 'garage') renderGarage(content);
    else if (tabId === 'stats') renderStats(content);
}

// --- DEEP SIM RACE LOGIC ---

function startRaceSession(seriesId) {
    const s = DATA.SERIES.find(x => x.id === seriesId);
    const track = DATA.TRACKS[Math.floor(Math.random() * DATA.TRACKS.length)];
    
    if (G.money < s.fee) return alert("Not enough cash!");
    G.money -= s.fee;

    G.session = {
        series: s,
        track: track,
        lap: 1,
        totalLaps: 5, // 5 Decision points per race
        position: 20 + Math.floor(Math.random() * 5),
        damage: 0
    };

    renderPrepScreen(); 
}

function calculateFitness() {
    const t = G.session.track;
    let score = (G.stats.speed + G.stats.craft) / 2;
    // Math: Setup must match track type
    if (t.type === "Short Track") score += (G.car.setup.suspension * 1.5);
    if (t.type === "Superspeedway") score += (G.car.setup.mapping * 1.5);
    if (t.type === "Road Course") score += (G.car.setup.wing * 1.5);
    return score;
}

function processDecision(choice) {
    const riskMap = { 'push': 0.3, 'defend': 0.1, 'save': 0.05 };
    const speedMap = { 'push': 3, 'defend': 1, 'save': -1 };

    // Incident Check
    if (Math.random() < (riskMap[choice] + (G.session.track.difficulty * 0.05))) {
        G.session.damage += 1;
        G.sr -= 0.04;
    }

    // Progression Math
    let fitness = calculateFitness();
    let gain = Math.floor((fitness / 8) + speedMap[choice] + (Math.random() * 2));
    G.session.position = Math.max(1, G.session.position - gain);
    
    G.session.lap++;
    if (G.session.lap > G.session.totalLaps) finishRace();
    else renderRaceMoment();
}

function finishRace() {
    const s = G.session.series;
    const pos = G.session.position;
    let payout = Math.floor(s.pay / pos);
    
    if (pos === 1) {
        payout += s.winBonus;
        G.wins++;
        if (G.wins % 3 === 0) G.tier++;
    }

    G.money += payout;
    G.history.push(`P${pos} at ${G.session.track.name} (+$${payout})`);
    saveGame();
    alert(`FINISH: P${pos}!\nEarned: $${payout}`);
    switchTab('dashboard');
}

function buyUpgrade(uid) {
    const u = DATA.UPGRADES.find(x => x.id === uid);
    if (G.money < u.cost) return alert("Too expensive!");
    G.money -= u.cost;
    G.stats[u.stat] += u.boost;
    saveGame();
    switchTab('garage');
}

function saveGame() { localStorage.setItem('ft_master_save_v2', JSON.stringify(G)); }
init();
