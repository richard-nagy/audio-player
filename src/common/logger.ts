import { getTimestamp } from "./functions";

const isDev = process.env.NODE_ENV === "development";

export const Logger = {
    log: (...args: unknown[]) => {
        if (isDev) {
            console.log(`[${getTimestamp()}]:`, ...args);
        }
    },
    warn: (...args: unknown[]) => {
        if (isDev) {
            console.warn(`[${getTimestamp()}]:`, ...args);
        }
    },
    error: (...args: unknown[]) => {
        if (isDev) {
            console.error(`[${getTimestamp()}]:`, ...args);
        }
    },
    debug: (...args: unknown[]) => {
        if (isDev) {
            console.debug(`[${getTimestamp()}]:`, ...args);
        }
    },
};
