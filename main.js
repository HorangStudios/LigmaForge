var { autoUpdater } = require("electron-updater");
var { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
var path = require('node:path');
var win;

function createWindow(args) {
	var urlstring = '';
	var resolution = [];
	var resize = true;

	if (args == "editor") {
		urlstring = `file://${path.join(__dirname, 'index.html')}`;
		resolution = [1000, 600];
	} else if (Array.isArray(args) && args[0] && args[0].startsWith("horanghill://")) {
		const filePath = path.join(__dirname, './player/index.html');
		const gameId = new URLSearchParams(new URL(args[0]).search).get('id');
		urlstring = `file://${filePath}?id=${gameId}&online=true`;
		resolution = [1000, 600];
	} else {
		urlstring = `file://${path.join(__dirname, 'splash.html')}`;
		resolution = [600, 350];
		resize = false;
	}

	win = new BrowserWindow({
		width: resolution[0],
		height: resolution[1],
		backgroundColor: '#1d1d1d',
		autoHideMenuBar: true,
		icon: path.join(__dirname, './assets/icon.png'),
		resizable: resize,
		webPreferences: { preload: path.join(__dirname, 'js/preload.js') }
	});

	win.loadURL(urlstring);
}

ipcMain.handle('redirect', async (event, url) => shell.openExternal(url));
ipcMain.handle('editor', async (event, url) => createWindow("editor"));

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on("update-available", (info) => {
	console.log(`Update available. Current version ${app.getVersion()}`);
	if (win) win.webContents.send('updates', 'update_available');
});

autoUpdater.on("update-not-available", (info) => {
	console.log(`No update available. Current version ${app.getVersion()}`);
	if (win) win.webContents.send('updates', 'no_update_available');
});

autoUpdater.on("download-progress", (progress) => {
	console.log(`Downloading update: ${progress.percent.toFixed(1)}%`);
});

autoUpdater.on("update-downloaded", (info) => {
	console.log(`Update downloaded. Current version ${app.getVersion()}`);
	setTimeout(() => {
		autoUpdater.quitAndInstall(false, true);
	}, 1000);
});

if (process.defaultApp) {
	if (process.argv.length >= 2) {
		app.setAsDefaultProtocolClient('horanghill', process.execPath, [path.resolve(process.argv[1])]);
	}
} else {
	app.setAsDefaultProtocolClient('horanghill');
}

var gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();
else {
	app.on('second-instance', (event, commandLine) => {
		var protocolUrl = commandLine.find(arg => arg.startsWith('horanghill://'));
		if (protocolUrl && win) win.focus();
	});

	app.whenReady().then(() => {
		var args = [];

		if (app.isPackaged) {
			var protocolUrl = process.argv.find(arg => arg.startsWith('horanghill://'));
			if (protocolUrl) args = [protocolUrl];
		} else {
			args = process.argv.slice(2);
		}

		createWindow(args);

		if (app.isPackaged) {
			setTimeout(() => {
				console.log("Checking for updates...");

				autoUpdater.checkForUpdates().catch((error) => {
					console.error("Update check failed:", error);
				});
			}, 1000);
		} else {
			win.webContents.on('did-finish-load', () => {
				win.webContents.send('updates', 'no_update_available');
			});
		}
	});
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow([]);
});