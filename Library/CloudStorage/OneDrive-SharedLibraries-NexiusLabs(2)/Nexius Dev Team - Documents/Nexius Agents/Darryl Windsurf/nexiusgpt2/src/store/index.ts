import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

// Import slices
import messagesReducer from './slices/messagesSlice';
import conversationsReducer from './slices/conversationsSlice';
import agentsReducer from './slices/agentsSlice';
import uiReducer from './slices/uiSlice';
import tasksReducer from './slices/tasksSlice';
import remindersReducer from './slices/remindersSlice';
import profileReducer from './slices/profileSlice';
import chatReducer from './slices/chatSlice';
import simpleRemindersReducer from './slices/simpleRemindersSlice';

// Create the store
export const store = configureStore({
  reducer: {
    messages: messagesReducer,
    conversations: conversationsReducer,
    agents: agentsReducer,
    ui: uiReducer,
    tasks: tasksReducer,
    reminders: remindersReducer,
    profile: profileReducer,
      chat: chatReducer,
      simpleReminders: simpleRemindersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['ui/setLastMessageTimestamp'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['messages.entities.timestamp'],
      },
    }),
});

// Set up listeners for RTK Query (for future use)
setupListeners(store.dispatch);

// Infer the RootState and AppDispatch types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;