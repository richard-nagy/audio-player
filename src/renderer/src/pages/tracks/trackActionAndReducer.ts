import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from "axios";
import Constant from "../../../../common/constants";
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
    "track/fetchTracks",
    async (_, { rejectWithValue }) => {
        try {
            const folderPath = await window.electron.openFolder();
            if (!folderPath) {
                throw new Error("No folder selected");
            }

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
        setSelectedTracks: (state, action: PayloadAction<Guid>) => {
            state.activeTrackId = action.payload;
        },
        setTrackFiles: (state, action: PayloadAction<TrackMetadata[]>) => {
            state.tracks = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTracks.fulfilled, (state, action) => {
            console.log(action.payload);
            state.tracks = action.payload;
        });
        builder.addCase(fetchTracks.rejected, (_state, action) => {
            console.error("Fetch tracks failed:", action.payload);
        });
    },
});

export const { setSelectedTrack, setTrackFiles } = trackSlice.actions;
export default trackSlice.reducer;
