import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
    ...electronAPI,
    openFolder: () => ipcRenderer.invoke("dialog-openFolder"),
    finishLoad: () => ipcRenderer.invoke("did-finish-load"),
    removeSetFilesListener: () => ipcRenderer.removeAllListeners("set-files"),
    ipcRenderer: {
        on: (channel, listener) => ipcRenderer.on(channel, listener),
        removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
    }
});
