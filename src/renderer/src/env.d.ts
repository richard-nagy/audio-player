import { ElectronAPI } from "@electron-toolkit/preload";
/// <reference types="vite/client" />

export interface Electron extends ElectronAPI {
    openFolder: () => Promise<File[]>;
}

declare global {
    interface Window {
        electron: Electron;
    }
}
