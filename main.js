const { app, BrowserWindow, screen, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let win = null;
let tray = null;

const critterTitles = {
  cat: '🐈',
  sloth: '🦥',
  ghost: '👻',
  'blue-eye': '🧿',
  'nimbu-mirchi': '🍋',
};

function selectCritter(name) {
  if (win) win.webContents.send('critter', name);
  if (tray) tray.setTitle(critterTitles[name] || '🐈');
}

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { x, y, width, height } = display.bounds;
  const menuBarHeight = Math.max(0, display.workArea.y - y);

  win = new BrowserWindow({
    x, y, width, height,
    transparent: true,       // no window background
    frame: false,            // no title bar
    hasShadow: false,
    resizable: false,
    movable: false,
    focusable: false,        // never steals focus from your real work
    skipTaskbar: true,
    enableLargerThanScreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Float above everything, including full-screen apps on other Spaces.
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // Start fully click-through. `forward: true` still delivers mousemove to the
  // renderer, which is how we know when the pointer is over the critter.
  win.setIgnoreMouseEvents(true, { forward: true });

  win.loadFile(path.join(__dirname, 'renderer.html'), {
    query: { menuBarHeight: String(menuBarHeight) },
  });

  // The renderer tells us whether the cursor is on the critter right now.
  ipcMain.on('hit-region', (_e, isOverCritter) => {
    if (!win) return;
    win.setIgnoreMouseEvents(!isOverCritter, { forward: true });
  });

  win.on('closed', () => { win = null; });
}

function createTray() {
  // A text-only menu bar item, so there's no icon file to ship.
  tray = new Tray(nativeImage.createEmpty());
  tray.setTitle('🍋');
  tray.setToolTip('Dangle');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Recenter', click: () => win && win.webContents.send('recenter') },
    { label: 'Charm Blue Eye', click: () => selectCritter('blue-eye') },
    { label: 'Nimbu Mirchi', click: () => selectCritter('nimbu-mirchi') },
    { type: 'separator' },
    { label: 'Quit Dangle', accelerator: 'Command+Q', click: () => app.quit() },
  ]));
}

app.whenReady().then(() => {
  if (app.dock) app.dock.hide();   // menu bar app, not a Dock app
  createWindow();
  createTray();

  // Follow the screen if you plug in or unplug a monitor.
  screen.on('display-metrics-changed', () => {
    if (!win) return;
    const b = screen.getPrimaryDisplay().bounds;
    win.setBounds(b);
  });
});

app.on('window-all-closed', (e) => e.preventDefault());  // stay alive in the menu bar
