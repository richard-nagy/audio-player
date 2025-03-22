import { TrackExtensions } from "../renderer/src/pages/tracks/types";

export const filterTracks = (file: string): boolean => {
    const index = file.lastIndexOf('.');

    if (index > -1) {
        return Object.values(TrackExtensions).includes(file.slice(index) as TrackExtensions);
    }

    return false;
};

/**
 * Returns the current timestamp in **HH:MM:SS.sss** format.
 * @returns {string} The formatted timestamp.
 */
export const getTimestamp = () => {
    return new Date().toISOString().split('T')[1].slice(0, -1);
};
