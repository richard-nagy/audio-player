import { ElectronAPI } from "@electron-toolkit/preload";
import { UserSettingKey } from "../../main/types";
import { TrackMetadata } from "./pages/tracks/types";
/// <reference types="vite/client" />

export interface Electron extends ElectronAPI {
    openFolder: () => Promise<TrackMetadata[]>;
    getSetting: <T>(key: UserSettingKey) => Promise<T>;
    setSetting: (key: UserSettingKey, value: unknown) => Promise<void>;
    removeSetFilesListener: () => void;
}

declare global {
    interface Window {
        electron: Electron;
    }
}
