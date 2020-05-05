const electron = require('electron');
const { app, BrowserWindow } = require('electron');
const { fork } = require('child_process');
const findOpenSocket = require('./find-open-socket');
const isDev = require('electron-is-dev');
const path = require('path');
const url = require('url');

let clientWin;
let serverWin;
let serverProcess;
let serverSocket;

function createWindow(socketName) {
  clientWin = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      preload: __dirname + '/client-preload.js',
    },
  });

  if (!isDev) {
    clientWin.loadFile(path.join(__dirname, '../client/build/index.html'));
  } else {
    clientWin.loadURL('http://localhost:3000');
  }

  clientWin.webContents.on('did-finish-load', () => {
    clientWin.webContents.send('set-socket', {
      name: socketName,
    });
  });
}

function createBackgroundWindow(socketName) {
  const win = new BrowserWindow({
    x: 500,
    y: 300,
    width: 700,
    height: 500,
    show: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.loadURL(`file://${__dirname}/server-dev.html`);

  win.webContents.on('did-finish-load', () => {
    win.webContents.send('set-socket', { name: socketName });
  });

  serverWin = win;
}

function createBackgroundProcess(socketName) {
  serverProcess = fork(__dirname + '/server.js', [
    '--subprocess',
    app.getVersion(),
    socketName,
  ]);

  serverProcess.on('message', (msg) => {
    console.log(msg);
  });
}

app.on('ready', async () => {
  serverSocket = await findOpenSocket();

  createWindow(serverSocket);

  if (isDev) {
    createBackgroundWindow(serverSocket);
  } else {
    createBackgroundProcess(serverSocket);
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
