import { configureStore } from '@reduxjs/toolkit';
import audioReducer from './audioActionAndReducer';

export const store = configureStore({
    reducer: {
        audio: audioReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;