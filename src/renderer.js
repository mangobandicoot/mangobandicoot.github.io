// ═══════════════════════════════════════════════════════════════════════════════
// FULL THROTTLE v2.0 — UI RENDERER (COMPLETE)
// ═══════════════════════════════════════════════════════════════════════════════

function renderDashboard(c) {
    c.innerHTML = `
        <div class="card">
            <h2>Driver Profile</h2>
            <p>Safety Rating: <strong style="color:var(--accent)">${G.sr.toFixed(2)}</strong></p>
            <p>Condition: ${G.car.condition}%</p>
        </div>
        <div class="card">
            <h3>Recent History</h3>
            ${G.history.slice(-5).reverse().map(h => `<p style="font-size:14px; border-bottom:1px solid #1E2433; padding:5px 0;">${h}</p>`).join('') || 'No races yet.'}
        </div>
    `;
}

function renderRaceMenu(c) {
    c.innerHTML = '<h1>Series Schedule</h1>';
    DATA.SERIES.forEach(s => {
        const locked = G.tier < s.tier;
        c.innerHTML += `
            <div class="card" style="opacity:${locked ? 0.5 : 1}; border-left: 4px solid ${s.color}">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div><h3>${s.name}</h3><small>$${s.fee} Entry</small></div>
                    <button class="btn-primary" onclick="startRaceSession('${s.id}')" ${locked ? 'disabled' : ''}>
                        ${locked ? 'LOCKED' : 'ENTER'}
                    </button>
                </div>
            </div>
        `;
    });
}

function renderPrepScreen() {
    const c = document.getElementById('game-content');
    c.innerHTML = `
        <div class="card">
            <h2>Race Prep: ${G.session.track.name}</h2>
            <p>Type: ${G.session.track.type}</p>
            <hr style="border:0; border-top:1px solid var(--border); margin:15px 0;">
            <p>Adjust Setup Strategy:</p>
            <div style="display:grid; gap:10px; margin-bottom:20px;">
                <label>Aero/Wing: <input type="range" min="1" max="10" value="${G.car.setup.wing}" onchange="G.car.setup.wing = parseInt(this.value)"></label>
                <label>Suspension: <input type="range" min="1" max="10" value="${G.car.setup.suspension}" onchange="G.car.setup.suspension = parseInt(this.value)"></label>
            </div>
            <button class="btn-primary" style="width:100%" onclick="renderRaceMoment()">START RACE</button>
        </div>
    `;
}

function renderRaceMoment() {
    const c = document.getElementById('game-content');
    c.innerHTML = `
        <div class="card">
            <div style="display:flex; justify-content:space-between; font-weight:900;">
                <span style="color:var(--accent)">LAP ${G.session.lap}/${G.session.totalLaps}</span>
                <span>P${G.session.position}</span>
            </div>
            <div style="background:#161B22; height:8px; margin:15px 0; border-radius:4px;">
                <div style="background:var(--accent); height:100%; width:${(G.session.lap / G.session.totalLaps)*100}%;"></div>
            </div>
            <h3 style="text-align:center; margin-bottom:20px;">Tactical Decision</h3>
            <div style="display:grid; gap:10px;">
                <button class="btn-primary" onclick="processDecision('push')">PUSH HARD (High Risk)</button>
                <button class="btn-primary" style="background:var(--blue)" onclick="processDecision('defend')">HOLD LINE (Safe)</button>
                <button class="btn-primary" style="background:#10B981" onclick="processDecision('save')">SAVE TIRES (Slow)</button>
            </div>
        </div>
    `;
}

function renderGarage(c) {
    c.innerHTML = '<h1>Upgrade Shop</h1>';
    DATA.UPGRADES.forEach(u => {
        c.innerHTML += `
            <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
                <div><strong>${u.name}</strong><br><small>+${u.boost} ${u.stat}</small></div>
                <button class="btn-primary" onclick="buyUpgrade('${u.id}')">$${u.cost}</button>
            </div>
        `;
    });
}

function renderStats(c) {
    c.innerHTML = `
        <div class="card">
            <h2>Driver Stats</h2>
            <p>Speed: ${G.stats.speed}</p>
            <p>Racecraft: ${G.stats.craft}</p>
            <p>Consistency: ${G.stats.consistency}</p>
        </div>
    `;
}
