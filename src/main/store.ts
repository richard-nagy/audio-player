import Store from "electron-store";

interface UserSettings {
    selectedFolderPaths: string[];
    /** title + artist */
    lastTrack: string | null;
}

export const settingsStore = new Store<UserSettings>({
    defaults: {
        selectedFolderPaths: [],
        lastTrack: null,
    },
});
