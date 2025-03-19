import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store"; // Import your root state type
import { AudioMetadata } from "./types";
import { Guid } from "../../../common/types";

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
