import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from "axios";
import Constant from "../../../../common/constants";
import { Logger } from "../../../../common/logger";
import { UserSettingKey } from "../../../../main/types";
import { TrackMetadata } from "./types";

export interface TrackState {
    tracks: TrackMetadata[];
    playlistPosition: number | null;
    autoPlayIsOn: boolean;
}

const initialState: TrackState = {
    tracks: [],
    playlistPosition: null,
    autoPlayIsOn: false,
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

            window.electron.setSetting(UserSettingKey.SelectedFolderPaths, [folderPath]);
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
        setTracks: (state, action: PayloadAction<TrackMetadata[]>) => {
            state.tracks = action.payload;
        },
        setPlaylistPosition: (state, action: PayloadAction<number | null>) => {
            state.playlistPosition = action.payload;
        },
        toggleAutoPlay: (state, action: PayloadAction<boolean>) => {
            state.autoPlayIsOn = action.payload;
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

export const { setTracks, setPlaylistPosition, toggleAutoPlay } = tracksSlice.actions;
export default tracksSlice.reducer;
