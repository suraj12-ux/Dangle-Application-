const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dangle', {
  // Renderer -> main: "the cursor is (or isn't) over the critter"
  setHit: (isOver) => ipcRenderer.send('hit-region', isOver),
  // Main -> renderer: menu bar commands
  onRecenter: (fn) => ipcRenderer.on('recenter', () => fn()),
  onCritter: (fn) => ipcRenderer.on('critter', (_e, name) => fn(name)),
});
