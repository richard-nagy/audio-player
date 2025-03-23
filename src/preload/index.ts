import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
    ...electronAPI,
    openFolder: () => ipcRenderer.invoke("dialog-openFolder"),
    getSetting: (key: string) => ipcRenderer.invoke("get-setting", key),
    setSetting: (key: string, value: unknown) => ipcRenderer.invoke("set-setting", key, value),
    removeSetFilesListener: () => ipcRenderer.removeAllListeners("set-files"),
    ipcRenderer: {
        on: (channel, listener) => ipcRenderer.on(channel, listener),
        removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
    }
});
