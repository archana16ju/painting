const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  printReceipt: (html) => ipcRenderer.invoke('print-receipt', html),
  printLidLabel: (labelData) => ipcRenderer.invoke('print-lid-label', labelData),
});
