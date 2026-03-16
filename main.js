const { app, BrowserWindow, ipcMain } = require(‘electron’);
const path = require(‘path’);
const fs   = require(‘fs’);
const os   = require(‘os’);

const SAVE_DIR  = path.join(os.homedir(), ‘Documents’, ‘FullThrottleRPG’);
const SAVE_FILE = path.join(SAVE_DIR, ‘career.json’);
const BACK_DIR  = path.join(SAVE_DIR, ‘backups’);

function ensureDirs() {
[SAVE_DIR, BACK_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, {recursive:true}); });
}

function createWindow() {
ensureDirs();
const win = new BrowserWindow({
width: 1024, height: 768,
minWidth: 800, minHeight: 600,
title: ‘Full Throttle RPG’,
webPreferences: {
preload: path.join(__dirname, ‘rpg-preload.js’),
contextIsolation: true,
nodeIntegration: false,
},
});
win.loadFile(‘rpg.html’);
win.setMenuBarVisibility(false);
}

ipcMain.handle(‘save-career’, async (_, data) => {
ensureDirs();
// Backup before saving
if (fs.existsSync(SAVE_FILE)) {
const ts = new Date().toISOString().replace(/[:.]/g,’-’).slice(0,19);
const backFile = path.join(BACK_DIR, `career-${ts}.json`);
fs.copyFileSync(SAVE_FILE, backFile);
// Keep last 10 backups
const backs = fs.readdirSync(BACK_DIR).sort();
if (backs.length > 10) backs.slice(0, backs.length-10).forEach(b => fs.unlinkSync(path.join(BACK_DIR,b)));
}
fs.writeFileSync(SAVE_FILE, data, ‘utf8’);
return true;
});

ipcMain.handle(‘load-career’, async () => {
ensureDirs();
if (!fs.existsSync(SAVE_FILE)) return null;
return fs.readFileSync(SAVE_FILE, ‘utf8’);
});

app.whenReady().then(createWindow);
app.on(‘window-all-closed’, () => { if (process.platform !== ‘darwin’) app.quit(); });
app.on(‘activate’, () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });