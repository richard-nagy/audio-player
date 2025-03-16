import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", electronAPI);
contextBridge.exposeInMainWorld("electron", { openFolder: () => ipcRenderer.invoke('dialog-openFolder') });
