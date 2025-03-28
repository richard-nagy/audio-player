import { Guid } from "../../../../common/types";

export enum TrackExtensions {
    MP3 = ".mp3",
    WAV = ".wav",
    OGG = ".ogg",
    FLAC = ".flac",
    AAC = ".aac",
    M4A = ".m4a",
    WMA = ".wma",
};

export interface TrackMetadata {
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

export interface Album {
    id: Guid;
    name: string;
    artist: string;
    trackIds: Guid[];
}

export interface Artist {
    id: Guid;
    name: string;
    trackIds: Guid[];
}
