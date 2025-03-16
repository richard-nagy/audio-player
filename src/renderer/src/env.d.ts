import { ElectronAPI } from "@electron-toolkit/preload";
import { AudioFile } from "../../common/types";
/// <reference types="vite/client" />

export interface Electron extends ElectronAPI {
    openFolder: () => Promise<AudioFile[]>;
    onSetFiles: (callback: (files: AudioFile[]) => void) => void;
    removeSetFilesListener: () => void;
}

declare global {
    interface Window {
        electron: Electron;
    }
}
