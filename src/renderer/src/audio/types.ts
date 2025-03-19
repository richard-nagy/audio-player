import { Guid } from "../../../common/types";

export enum AudioExtensions {
    MP3 = ".mp3",
    WAV = ".wav",
    OGG = ".ogg",
    FLAC = ".flac",
    AAC = ".aac",
    M4A = ".m4a",
    WMA = ".wma",
};

export interface AudioMetadata {
    id: Guid;
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
