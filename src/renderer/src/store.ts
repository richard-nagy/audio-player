import { configureStore } from '@reduxjs/toolkit';
import audioReducer, { AudioState } from './audio/audioActionAndReducer';

export interface RootState {
    audio: AudioState;
}
export const store = configureStore({
    reducer: {
        audio: audioReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppDispatch = typeof store.dispatch;
