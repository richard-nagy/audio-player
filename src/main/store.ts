import Store from "electron-store";
import { UserSettings } from "./types";

export const settingsStore = new Store<UserSettings>({
    defaults: {
        selectedFolderPaths: [],
        playlist: new Map(),
        playlistPosition: null,
    },
});
