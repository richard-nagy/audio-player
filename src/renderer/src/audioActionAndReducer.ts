import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import Constant from "../../common/constants";
import { AudioFile } from "../../common/types";

export interface AudioState {
    audioUrl: string | null;
    audioFiles: AudioFile[];
}

const initialState: AudioState = {
    audioUrl: null,
    audioFiles: [],
};

export const fetchAudio = createAsyncThunk(
    'audio/fetchAudio',
    async (filePath: string) => {
        const url = `${Constant.port.server}/audio?filePath=${encodeURIComponent(filePath)}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const audioUrl = response.url;
        return audioUrl;
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
            state.audioUrl = action.payload;
        });
    },
});

export const { setFiles } = audioSlice.actions;
export default audioSlice.reducer;