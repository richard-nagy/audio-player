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
