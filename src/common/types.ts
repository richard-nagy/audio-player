export enum AudioExtensions {
    MP3 = ".mp3",
    WAV = ".wav",
    OGG = ".ogg",
    FLAC = ".flac",
    AAC = ".aac",
    M4A = ".m4a",
    WMA = ".wma",
};

export interface AudioFile {
    name: string;
    path: string;
    type: AudioExtensions;
}

export interface AudioMetadata {
    url: string;
    metadata: {
        title: string;
        artist: string;
        album: string;
        genre: string[];
        duration: number | string;
        format: string;
        size: number;
    };
}