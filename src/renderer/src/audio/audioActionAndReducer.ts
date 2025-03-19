import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from "axios";
import Constant from "../../../common/constants";
import { Guid } from "../../../common/types";
import { AudioMetadata } from "./types";

export interface AudioState {
    audioFiles: AudioMetadata[];
    activeAudioId: Guid | null;
}

const initialState: AudioState = {
    audioFiles: [],
    activeAudioId: null,
};

export const fetchAudios = createAsyncThunk<AudioMetadata[], void, { rejectValue: string }>(
    "audio/fetchAudios",
    async (_, { rejectWithValue }) => {
        try {
            const folderPath = await window.electron.openFolder();
            if (!folderPath) {
                throw new Error("No folder selected");
            }

            const response = await axios.get<AudioMetadata[]>(`${Constant.port.server}/audios`, {
                params: { folderPath },
                validateStatus: (status) => status === 200,
            });

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data ?? "Failed to fetch audios");
            } else if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Unknown error occurred");
        }
    }
);

export const initialFetchAudios = createAsyncThunk<AudioMetadata[], string, { rejectValue: string }>(
    "audio/fetchAudios",
    async (folderPath: string, { rejectWithValue }) => {
        try {
            const response = await axios.get<AudioMetadata[]>(`${Constant.port.server}/audios`, {
                params: { folderPath },
                validateStatus: (status) => status === 200,
            });

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data ?? "Failed to fetch audios");
            } else if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Unknown error occurred");
        }
    }
);

export const audioSlice = createSlice({
    name: "audio",
    initialState,
    reducers: {
        setSelectedAudio: (state, action: PayloadAction<Guid>) => {
            state.activeAudioId = action.payload;
        },
        setAudioFiles: (state, action: PayloadAction<AudioMetadata[]>) => {
            state.audioFiles = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAudios.fulfilled, (state, action) => {
            console.log(action.payload);
            state.audioFiles = action.payload;
        });
        builder.addCase(fetchAudios.rejected, (_state, action) => {
            console.error("Fetch audios failed:", action.payload);
        });
    },
});

export const { setSelectedAudio, setAudioFiles } = audioSlice.actions;
export default audioSlice.reducer;
