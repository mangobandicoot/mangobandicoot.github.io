const { app, BrowserWindow } = require('electron');
const { config, getPreloadPath, getIndexPath } = require('./src/config');
const IPCHandlers = require('./src/ipcHandlers');

let mainWindow;
let ipcHandlers;

function createWindow() {
  const win = new BrowserWindow({
    width: config.app.defaultWidth,
    height: config.app.defaultHeight,
    minWidth: config.app.minWidth,
    minHeight: config.app.minHeight,
    title: config.window.title,
    webPreferences: {
      ...config.window.webPreferences,
      preload: getPreloadPath()
    }
  });

  win.loadFile(getIndexPath());
  win.setMenuBarVisibility(config.window.showMenuBar);

  if (config.development.openDevTools) {
    win.webContents.openDevTools();
  }

  return win;
}

function initializeApp() {
  mainWindow = createWindow();
  ipcHandlers = new IPCHandlers();
  ipcHandlers.registerHandlers();
}

function cleanup() {
  if (ipcHandlers) {
    ipcHandlers.unregisterHandlers();
  }
}

app.whenReady().then(initializeApp);

app.on('window-all-closed', () => {
  cleanup();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow();
    ipcHandlers = new IPCHandlers();
    ipcHandlers.registerHandlers();
  }
});

app.on('before-quit', cleanup);
