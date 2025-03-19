import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from "axios";
import Constant from "../../common/constants";
import { AudioFile, AudioMetadata } from "../../common/types";

export interface AudioState {
    selectedAudio: AudioMetadata | null;
    audioFiles: AudioFile[];
}

const initialState: AudioState = {
    selectedAudio: null,
    audioFiles: [],
};

export const fetchAudio = createAsyncThunk(
    "audio/fetchAudio",
    async (filePath: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${Constant.port.server}/audio`, {
                params: { filePath },
                validateStatus: (status) => status === 200,
            });

            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data ?? "Failed to fetch audio");
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
        setFiles: (state, action: PayloadAction<AudioFile[]>) => {
            state.audioFiles = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAudio.fulfilled, (state, action) => {
            state.selectedAudio = {
                ...action.payload,
                url: `${Constant.port.server}${action.payload.url}`,
            };
        });
        builder.addCase(fetchAudio.rejected, (_state, action) => {
            console.error("Fetch audio failed:", action.payload);
        });
    },
});

export const { setFiles } = audioSlice.actions;
export default audioSlice.reducer;
