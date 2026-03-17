// FULL THROTTLE v1.5.2 - MASTER ENGINE
let G = null; 
let DATA = null;
let activeTab = 'dashboard';

async function init() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error("Data fetch failed");
        DATA = await response.json();
        
        const saved = localStorage.getItem('ft_master_save');
        if (saved) { 
            G = JSON.parse(saved); 
            launchGame(); 
        }
    } catch (e) { 
        console.error("Initialization Error:", e);
    }
}

function handleStartCareer() {
    const nameInput = document.getElementById('player-name');
    if (!nameInput || !nameInput.value.trim()) return alert("Enter Driver Name!");

    G = {
        name: nameInput.value.trim(),
        money: 1200, wins: 0, rep: 0, tier: 1, sr: 2.50,
        stats: { speed: 5, craft: 5, consistency: 5 },
        upgrades: { engine: 0, aero: 0, tires: 0 },
        history: [], rivalData: {}
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

    document.getElementById('display-name').innerText = G.name;
    document.getElementById('display-money').innerText = `$${G.money.toLocaleString()}`;
    document.getElementById('display-wins').innerText = G.wins;
    document.getElementById('display-tier').innerText = `Tier ${G.tier} | SR: ${G.sr.toFixed(2)}`;

    const content = document.getElementById('game-content');
    content.innerHTML = ''; 

    if (tabId === 'dashboard') renderDashboard(content);
    else if (tabId === 'race') renderRaceMenu(content);
    else if (tabId === 'garage') renderGarage(content);
    else if (tabId === 'stats') renderStats(content);
}

function renderDashboard(c) {
    c.innerHTML = `
        <div class="card">
            <h2>Driver Profile</h2>
            <p>Safety Rating: <strong style="color:${G.sr >= 3 ? '#10B981' : '#F59E0B'}">${G.sr.toFixed(2)}</strong></p>
        </div>
        <div class="card">
            <h3>Recent History</h3>
            ${G.history.slice(-5).reverse().map(h => `<p style="border-bottom:1px solid #1E2433; padding:5px 0;">${h}</p>`).join('') || '<p>No races yet.</p>'}
        </div>
    `;
}

function renderRaceMenu(c) {
    c.innerHTML = '<h1>Series Schedule</h1>';
    DATA.SERIES.forEach(s => {
        const locked = G.tier < s.tier;
        c.innerHTML += `
            <div class="card" style="opacity:${locked ? 0.4 : 1}; border-left:6px solid ${s.color}">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div><h3>${s.name}</h3><small>Entry: $${s.fee}</small></div>
                    <button class="btn-primary" onclick="runRace('${s.id}')" ${locked ? 'disabled' : ''}>ENTER</button>
                </div>
            </div>
        `;
    });
}

function runRace(sid) {
    const s = DATA.SERIES.find(x => x.id === sid);
    const track = DATA.TRACKS[Math.floor(Math.random() * DATA.TRACKS.length)];
    if (G.money < s.fee) return alert("Not enough money!");
    
    G.money -= s.fee;
    let skill = G.stats.speed + G.stats.craft + G.stats.consistency;
    let finish = Math.floor(22 - (skill / 1.5) + (Math.random() * 8) + (track.difficulty * 2));
    finish = Math.max(1, Math.min(20, finish));

    let incidents = Math.floor(Math.random() * 5);
    let srChange = (0.05 - (incidents * 0.02));
    let payout = Math.floor(s.pay / finish);

    if (finish === 1) { G.wins++; payout = s.pay + s.winBonus; }
    G.money += payout;
    G.sr = Math.max(1.0, Math.min(4.99, G.sr + srChange));
    G.history.push(`P${finish} at ${track.name} (+$${payout})`);

    saveGame();
    alert(`P${finish} at ${track.name}\nIncidents: ${incidents}x`);
    switchTab('race');
}

function renderGarage(c) {
    c.innerHTML = '<h1>Garage</h1>';
    DATA.UPGRADES.forEach(u => {
        c.innerHTML += `
            <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
                <div><strong>${u.name}</strong><br><small>+$1 ${u.stat}</small></div>
                <button class="btn-primary" onclick="buyUpgrade('${u.id}')">$${u.cost}</button>
            </div>
        `;
    });
}

function buyUpgrade(uid) {
    const u = DATA.UPGRADES.find(x => x.id === uid);
    if (G.money < u.cost) return alert("Too expensive!");
    G.money -= u.cost;
    G.stats[u.stat] += u.boost;
    saveGame();
    switchTab('garage');
}

function renderStats(c) {
    c.innerHTML = `<div class="card"><h2>Stats</h2><p>Speed: ${G.stats.speed}</p><p>Wins: ${G.wins}</p></div>`;
}

function saveGame() { localStorage.setItem('ft_master_save', JSON.stringify(G)); }
init();
