import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import Constant from "../../common/constants";
import { AudioMetadata, AudioFile } from "../../common/types";

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
            const url = `${Constant.port.server}/audio?filePath=${encodeURIComponent(filePath)}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json(); // Extract JSON data from the response
            return data; // Contains { url, metadata }
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const audioSlice = createSlice({
    name: 'audio',
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
                url: Constant.port.server + action.payload.url
            };
        });
    },
});

export const { setFiles } = audioSlice.actions;
export default audioSlice.reducer;