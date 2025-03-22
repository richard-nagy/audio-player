import { ElectronAPI } from "@electron-toolkit/preload";
import { TrackMetadata } from "./pages/tracks/types";
/// <reference types="vite/client" />

export interface Electron extends ElectronAPI {
    openFolder: () => Promise<TrackMetadata[]>;
    finishLoad: () => void;
    removeSetFilesListener: () => void;
}

declare global {
    interface Window {
        electron: Electron;
    }
}
