export enum UserSettingKey {
    SelectedFolderPaths = "selectedFolderPaths",
    LastTrackUrl = "lastTrackUrl",
}

export interface UserSettings {
    selectedFolderPaths: string[];
    lastTrackUrl: string | null;
}
