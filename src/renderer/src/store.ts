import { configureStore } from '@reduxjs/toolkit';
import trackReducer, { TrackState } from './pages/tracks/tracksSlice';

export interface RootState {
    track: TrackState;
}
export const store = configureStore({
    reducer: {
        track: trackReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppDispatch = typeof store.dispatch;
