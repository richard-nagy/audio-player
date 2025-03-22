import { TrackExtensions } from "../renderer/src/pages/tracks/types";

export const filterTracks = (file: string): boolean => {
    const index = file.lastIndexOf('.');

    if (index > -1) {
        return Object.values(TrackExtensions).includes(file.slice(index) as TrackExtensions);
    }

    return false;
};
