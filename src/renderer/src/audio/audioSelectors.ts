import { createSelector } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from 'uuid';
import { Guid } from "../../../common/types";
import { RootState } from "../store"; // Import your root state type
import { Album, Artist, AudioMetadata } from "./types";

const getAudioFiles = (state: RootState): AudioMetadata[] => state.audio.audioFiles;
const getActiveAudioId = (state: RootState): Guid | null => state.audio.activeAudioId;

export const getAudioFileMap = createSelector(
    [getAudioFiles],
    (audioFiles): Map<Guid, AudioMetadata> => {
        return new Map(audioFiles.map((af) => [af.id, af]));
    }
);

export const getActiveAudio = createSelector(
    [getAudioFileMap, getActiveAudioId],
    (audioFileMap, activeAudioId): AudioMetadata | null => {
        if (activeAudioId) {
            return audioFileMap.get(activeAudioId) ?? null;
        }

        return null;
    }
);

export const getAlbums = createSelector(
    [getAudioFiles],
    (audioFiles) => {
        // We will use the album name as a key
        const albumMap = new Map<string, Album>();

        audioFiles.forEach(({ id: songId, metadata: { album: albumKey, artist } }) => {
            const existingAlbum = albumMap.get(albumKey);

            if (!existingAlbum) {
                albumMap.set(albumKey, {
                    id: uuidv4(),
                    name: albumKey,
                    artist,
                    songIds: [songId],
                });

                return;
            }

            albumMap.set(albumKey, {
                ...existingAlbum,
                songIds: [...existingAlbum.songIds, songId],
            });
        });

        return Array.from(albumMap.values());
    }
);

export const getArtists = createSelector(
    [getAudioFiles],
    (audioFiles) => {
        // We will use the artist name as a key
        const artistMap = new Map<string, Artist>();

        audioFiles.forEach(({ id: songId, metadata: { artist: artistKey } }) => {
            const existingArtists = artistMap.get(artistKey);

            if (!existingArtists) {
                artistMap.set(artistKey, {
                    id: uuidv4(),
                    name: artistKey,
                    songIds: [songId],
                });

                return;
            }

            artistMap.set(artistKey, {
                ...existingArtists,
                songIds: [...existingArtists.songIds, songId],
            });
        });

        return Array.from(artistMap.values());
    }
);
