import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";
import { AudioFile } from "../common/types";

contextBridge.exposeInMainWorld("electron", {
    ...electronAPI,
    openFolder: () => ipcRenderer.invoke("dialog-openFolder"),
    onSetFiles: (callback: (files: AudioFile[]) => void) => ipcRenderer.on("set-files", (_, files: AudioFile[]) => callback(files)),
    removeSetFilesListener: () => ipcRenderer.removeAllListeners("set-files"),
});
