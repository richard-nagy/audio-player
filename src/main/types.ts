export enum UserSettingKey {
    SelectedFolderPaths = "selectedFolderPaths",
    PlaylistPosition = "playlistPosition",
    Playlist = "playlist",
}

export interface UserSettings {
    selectedFolderPaths: string[];
    playlistPosition: number | null;
    playlist: Map<number, string>;
}
