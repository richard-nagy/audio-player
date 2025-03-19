import { ElectronAPI } from "@electron-toolkit/preload";
import { AudioFile } from "./audio/types";
/// <reference types="vite/client" />

export interface Electron extends ElectronAPI {
    openFolder: () => Promise<AudioFile[]>;
    finishLoad: () => void;
    removeSetFilesListener: () => void;
}

declare global {
    interface Window {
        electron: Electron;
    }
}
