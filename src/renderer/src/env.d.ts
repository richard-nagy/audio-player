import { ElectronAPI } from "@electron-toolkit/preload";
import { TrackMetadata } from "./pages/tracks/types";
/// <reference types="vite/client" />

export interface Electron extends ElectronAPI {
    openFolder: () => Promise<TrackMetadata[]>;
    getSetting: <T>(key: string) => Promise<T>;
    setSetting: (key: string, value: unknown) => Promise<void>;
    removeSetFilesListener: () => void;
}

declare global {
    interface Window {
        electron: Electron;
    }
}
