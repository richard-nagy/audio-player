import { createSelector } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from 'uuid';
import { Guid } from "../../../../common/types";
import { RootState } from "../../store"; // Import your root state type
import { Album, Artist, TrackMetadata } from "./types";

const getTracks = (state: RootState): TrackMetadata[] => state.track.tracks;
const getActiveTrackId = (state: RootState): Guid | null => state.track.activeTrackId;

export const getTrackMap = createSelector(
    [getTracks],
    (tracks): Map<Guid, TrackMetadata> => {
        return new Map(tracks.map((af) => [af.id, af]));
    }
);

export const getActiveTrack = createSelector(
    [getTrackMap, getActiveTrackId],
    (trackMap, activeTrackId): TrackMetadata | null => {
        if (activeTrackId) {
            return trackMap.get(activeTrackId) ?? null;
        }

        return null;
    }
);

export const getAlbums = createSelector(
    [getTracks],
    (tracks) => {
        // We will use the album name as a key
        const albumMap = new Map<string, Album>();

        tracks.forEach(({ id: songId, metadata: { album: albumKey, artist } }) => {
            const existingAlbum = albumMap.get(albumKey);

            if (!existingAlbum) {
                albumMap.set(albumKey, {
                    id: uuidv4(),
                    name: albumKey,
                    artist,
                    trackIds: [songId],
                });

                return;
            }

            albumMap.set(albumKey, {
                ...existingAlbum,
                trackIds: [...existingAlbum.trackIds, songId],
            });
        });

        return Array.from(albumMap.values());
    }
);

export const getArtists = createSelector(
    [getTracks],
    (tracks) => {
        // We will use the artist name as a key
        const artistMap = new Map<string, Artist>();

        tracks.forEach(({ id: songId, metadata: { artist: artistKey } }) => {
            const existingArtists = artistMap.get(artistKey);

            if (!existingArtists) {
                artistMap.set(artistKey, {
                    id: uuidv4(),
                    name: artistKey,
                    trackIds: [songId],
                });

                return;
            }

            artistMap.set(artistKey, {
                ...existingArtists,
                trackIds: [...existingArtists.trackIds, songId],
            });
        });

        return Array.from(artistMap.values());
    }
);
