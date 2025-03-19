import { AudioExtensions } from "./types";

export const filterAudioFiles = (file: string): boolean => {
    const index = file.lastIndexOf('.');

    if (index > -1) {
        return Object.values(AudioExtensions).includes(file.slice(index) as AudioExtensions);
    }

    return false;
};
