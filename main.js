var { autoUpdater, AppUpdater } = require("electron-updater");
var { app, BrowserWindow, electron, shell } = require("electron");
var path = require('node:path');
var win;

function createWindow(args) {
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    backgroundColor: '#1d1d1d',
    autoHideMenuBar: true,
    icon: './assets/icon.png',
    webPreferences: { contextIsolation: false }
  });

  if (args[0]) {
    const filePath = path.join(__dirname, './player/index.html');
    const gameId = new URLSearchParams(new URL('horanghill:///?id=-OgyZ3g6aJUivonWsvti').search).get('id');
    win.loadURL(`file://${filePath}?id=${gameId}&online=true`);
  } else {
    const filePath = path.join(__dirname, 'index.html');
    win.loadURL(`file://${filePath}`);
  }
}

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('horanghill', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('horanghill');
}

app.whenReady().then(() => {
  const args = app.isPackaged ? process.argv.slice(1) : process.argv.slice(2);  
  createWindow(args);
  autoUpdater.checkForUpdates();
  console.log(`Checking for updates. Current version ${app.getVersion()}`);
})

autoUpdater.on("update-available", (info) => {
  console.log(`Update available. Current version ${app.getVersion()}`);
  win.webContents.send('update_available');
});

autoUpdater.on("update-not-available", (info) => {
  console.log(`No update available. Current version ${app.getVersion()}`);
  win.webContents.send('no_update_available');
});

autoUpdater.on("update-downloaded", (info) => {
  console.log(`Update downloaded. Current version ${app.getVersion()}`);
  win.webContents.send('update_downloaded');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
})