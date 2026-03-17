// ═══════════════════════════════════════════════════════════════════════════════
// FULL THROTTLE v1.5.2 — MASTER LOGIC (PART 1/2)
// ═══════════════════════════════════════════════════════════════════════════════

let G = null; 
let DATA = null;
let activeTab = 'dashboard';

// --- INITIALIZE & DATA FETCH ---
async function init() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error("Could not load data.json.");
        DATA = await response.json();
        
        const saved = localStorage.getItem('ft_career_master_save');
        if (saved) { 
            G = JSON.parse(saved); 
            // Repair state for legacy saves
            if (!G.rivalData) G.rivalData = {};
            if (!G.upgrades) G.upgrades = { engine: 0, aero: 0, tires: 0 };
            launchGame(); 
        }
    } catch (e) { 
        console.error("BOOT ERROR:", e.message);
        alert("CRITICAL: data.json not found in root!");
    }
}

// --- CAREER START ---
function handleStartCareer() {
    const nameInput = document.getElementById('player-name');
    if (!nameInput || !nameInput.value.trim()) return alert("Enter Driver Name!");

    G = {
        name: nameInput.value.trim(),
        money: 1200,
        wins: 0,
        rep: 0,
        tier: 1,
        sr: 2.50, // Safety Rating
        stats: { speed: 5, craft: 5, consistency: 5 },
        upgrades: { engine: 0, aero: 0, tires: 0 },
        history: [],
        rivalData: {} // Tracking Heat (Anger)
    };

    saveGame();
    launchGame();
}

function launchGame() {
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-app').style.display = 'block';
    switchTab('dashboard');
}

// --- UI CONTROLLER ---
function switchTab(tabId) {
    activeTab = tabId;
    
    // Update Tab UI
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.toLowerCase() === tabId);
    });

    // Update Global Stats Header
    document.getElementById('display-name').innerText = G.name;
    document.getElementById('display-money').innerText = `$${G.money.toLocaleString()}`;
    document.getElementById('display-wins').innerText = G.wins;
    
    const tierText = document.getElementById('display-tier');
    if(tierText) tierText.innerText = `Tier ${G.tier} | SR: ${G.sr.toFixed(2)}`;

    const content = document.getElementById('game-content');
    content.innerHTML = ''; 

    // Routing
    if (tabId === 'dashboard') renderDashboard(content);
    else if (tabId === 'race') renderRaceMenu(content);
    else if (tabId === 'garage') renderGarage(content);
    else if (tabId === 'stats') renderStats(content);
}

// --- PERSISTENCE ---
function saveGame() { 
    localStorage.setItem('ft_career_master_save', JSON.stringify(G)); 
}
// ═══════════════════════════════════════════════════════════════════════════════
// FULL THROTTLE v1.5.2 — MASTER LOGIC (PART 2/2)
// ═══════════════════════════════════════════════════════════════════════════════

function renderDashboard(c) {
    c.innerHTML = `
        <div class="card">
            <h2>Driver Profile</h2>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div><small>Status</small><br><strong>${G.sr >= 4 ? 'Pro' : G.sr >= 3 ? 'Advanced' : 'Rookie'}</strong></div>
                <div><small>Safety Rating</small><br><strong style="color:${G.sr >= 3 ? '#10B981' : '#F59E0B'}">${G.sr.toFixed(2)}</strong></div>
            </div>
        </div>
        <div class="card">
            <h3>Recent Log</h3>
            ${G.history.length > 0 ? G.history.slice(-8).reverse().map(h => `<div style="font-size:14px; padding:6px 0; border-bottom:1px solid #1E2433;">${h}</div>`).join('') : '<p>No race data found.</p>'}
        </div>
    `;
}

function renderRaceMenu(c) {
    c.innerHTML = '<h1>Series Schedule</h1>';
    DATA.SERIES.forEach(s => {
        const locked = G.tier < s.tier;
        const div = document.createElement('div');
        div.className = 'card';
        div.style.opacity = locked ? "0.4" : "1";
        div.style.borderLeft = `6px solid ${s.color}`;
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h3 style="color:${s.color}; margin:0;">${s.name}</h3>
                    <p style="margin:4px 0; font-size:14px; color:#94A3B8;">${s.desc}</p>
                    <small>Entry: $${s.fee} | Payout: $${s.pay}+</small>
                </div>
                <button class="btn-primary" onclick="runRace('${s.id}')" ${locked ? 'disabled' : ''}>${locked ? 'LOCKED' : 'ENTER'}</button>
            </div>
        `;
        c.appendChild(div);
    });
}

function runRace(seriesId) {
    const s = DATA.SERIES.find(x => x.id === seriesId);
    const track = DATA.TRACKS[Math.floor(Math.random() * DATA.TRACKS.length)];
    const rival = DATA.RIVALS[Math.floor(Math.random() * DATA.RIVALS.length)];

    if (G.money < s.fee) return alert("Insufficient funds for entry fee!");
    G.money -= s.fee;

    // Logic: Driver skill vs Track Difficulty
    const playerPower = G.stats.speed + G.stats.craft + G.stats.consistency;
    let finish = Math.floor(22 - (playerPower / 1.8) + (Math.random() * 10) + (track.difficulty * 2));
    finish = Math.max(1, Math.min(20, finish));

    // iRacing Incidents (0x to 12x)
    let incidents = Math.floor(Math.random() * 5); 
    if (finish > 12) incidents += Math.floor(Math.random() * 5);
    
    // Safety Rating Math
    let srChange = (0.06 - (incidents * 0.02));

    // Rivalry/Heat System
    if (!G.rivalData[rival.name]) G.rivalData[rival.name] = 0;
    if (incidents > 4) G.rivalData[rival.name] += 1;

    // Financials
    let payout = Math.floor(s.pay / finish);
    let outcomeText = `P${finish} at ${track.name}`;

    if (finish === 1) {
        G.wins++;
        payout = s.pay + s.winBonus;
        outcomeText = `🏆 WIN at ${track.name}!`;
        // Auto-Promotion check
        if (G.wins % 5 === 0) {
            G.tier++;
            alert(`LICENSE PROMOTED! You are now Tier ${G.tier}!`);
        }
    }

    G.money += payout;
    G.sr = Math.max(1.0, Math.min(4.99, G.sr + srChange));
    G.history.push(`${outcomeText} | ${incidents}x | +$${payout.toLocaleString()}`);

    saveGame();
    alert(`${outcomeText}\n\nEarnings: $${payout.toLocaleString()}\nIncidents: ${incidents}x\nSR: ${srChange >= 0 ? '+' : ''}${srChange.toFixed(2)}`);
    switchTab('race');
}

function renderGarage(c) {
    c.innerHTML = '<h1>Upgrade Shop</h1>';
    DATA.UPGRADES.forEach(u => {
        const canAfford = G.money >= u.cost;
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h3 style="margin:0; font-size:18px;">${u.name}</h3>
                    <p style="margin:4px 0; font-size:13px; color:#94A3B8;">+${u.boost} to ${u.stat}</p>
                </div>
                <button class="btn-primary" onclick="buyUpgrade('${u.id}')" ${!canAfford ? 'disabled' : ''}>$${u.cost.toLocaleString()}</button>
            </div>
        `;
        c.appendChild(div);
    });
}

function buyUpgrade(upgradeId) {
    const u = DATA.UPGRADES.find(x => x.id === upgradeId);
    if (G.money < u.cost) return alert("Not enough money!");

    G.money -= u.cost;
    G.stats[u.stat] += u.boost;
    
    saveGame();
    alert(`Purchased ${u.name}! Your ${u.stat} is now ${G.stats[u.stat]}.`);
    switchTab('garage');
}

function renderStats(c) {
    c.innerHTML = `
        <div class="card">
            <h2>Attributes</h2>
            <p>Speed: ${G.stats.speed} | Craft: ${G.stats.craft} | Consistency: ${G.stats.consistency}</p>
        </div>
        <div class="card">
            <h2>The Field (Rivalry)</h2>
            ${DATA.RIVALS.map(r => `
                <div style="display:flex; justify-content:space-between; font-size:14px; border-bottom:1px solid #1E2433; padding:5px 0;">
                    <span>#${r.carNum} ${r.name}</span>
                    <span style="color:${(G.rivalData[r.name] || 0) > 3 ? '#EF4444' : '#94A3B8'}">Heat: ${G.rivalData[r.name] || 0}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// Kick off the app
init();
