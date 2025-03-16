import { ElectronAPI } from "@electron-toolkit/preload";

export interface Electron extends ElectronAPI {
    openFolder: () => Promise<{ name: string; path: string }[]>;
}

declare global {
    interface Window {
        electron: Electron;
    }
}