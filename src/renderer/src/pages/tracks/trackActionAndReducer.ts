import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from "axios";
import Constant from "../../../../common/constants";
import { Logger } from "../../../../common/logger";
import { Guid } from "../../../../common/types";
import { TrackMetadata } from "./types";

export interface TrackState {
    tracks: TrackMetadata[];
    activeTrackId: Guid | null;
}

const initialState: TrackState = {
    tracks: [],
    activeTrackId: null,
};

export const fetchTracks = createAsyncThunk<TrackMetadata[], void, { rejectValue: string }>(
    "tracks/fetchTracks",
    async (_, { rejectWithValue }) => {
        Logger.debug("📡 fetchTracks");
        try {
            const folderPath = await window.electron.openFolder();
            if (!folderPath) {
                throw new Error("No folder selected");
            }

            window.electron.setSetting("selectedFolderPaths", [folderPath]);
            const response = await axios.get<TrackMetadata[]>(`${Constant.port.server}/tracks`, {
                params: { folderPath },
                validateStatus: (status) => status === 200,
            });

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data ?? "Failed to fetch tracks");
            } else if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Unknown error occurred");
        }
    }
);

export const initialFetchTracks = createAsyncThunk<TrackMetadata[], string, { rejectValue: string }>(
    "tracks/fetchTracks",
    async (folderPath: string, { rejectWithValue }) => {
        Logger.debug("📡 initialFetchTracks");
        try {
            const response = await axios.get<TrackMetadata[]>(`${Constant.port.server}/tracks`, {
                params: { folderPath },
                validateStatus: (status) => status === 200,
            });

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data ?? "Failed to fetch tracks");
            } else if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Unknown error occurred");
        }
    }
);

export const tracksSlice = createSlice({
    name: "tracks",
    initialState,
    reducers: {
        setActiveTrack: (state, action: PayloadAction<Guid>) => {
            state.activeTrackId = action.payload;
        },
        setTracks: (state, action: PayloadAction<TrackMetadata[]>) => {
            state.tracks = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTracks.fulfilled, (state, action) => {
            state.tracks = action.payload;
        });
        builder.addCase(fetchTracks.rejected, (_state, action) => {
            Logger.error("Fetch tracks failed:", action.payload);
        });
    },
});

export const { setActiveTrack, setTracks } = tracksSlice.actions;
export default tracksSlice.reducer;
