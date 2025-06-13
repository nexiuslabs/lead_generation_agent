import { createSlice, createEntityAdapter, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { Reminder, reminderService } from '../../features/reminders/api/microsoftGraphApi';

// Create the entity adapter
const remindersAdapter = createEntityAdapter<Reminder>({
  // Sort reminders by date
  sortComparer: (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
});

// Define the initial state using the adapter
const initialState = remindersAdapter.getInitialState({
  loading: false,
  error: null as string | null,
  lastFetched: null as number | null,
  connectionStatus: {
    connected: false,
    permissions: {
      calendar: false,
      tasks: false,
    },
  },
});

// Async thunks
export const fetchReminders = createAsyncThunk(
  'reminders/fetchReminders',
  async (_, { rejectWithValue }) => {
    try {
      const reminders = await reminderService.getReminders();
      return reminders;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch reminders'
      );
    }
  }
);

export const createReminder = createAsyncThunk(
  'reminders/createReminder',
  async (
    reminderData: Omit<Reminder, 'id' | 'createdAt' | 'status' | 'microsoftId'>,
    { rejectWithValue }
  ) => {
    try {
      const reminder = await reminderService.createReminder(reminderData);
      return reminder;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to create reminder'
      );
    }
  }
);

export const updateReminder = createAsyncThunk(
  'reminders/updateReminder',
  async (
    { id, updates }: { id: string; updates: Partial<Reminder> },
    { rejectWithValue }
  ) => {
    try {
      const reminder = await reminderService.updateReminder(id, updates);
      return reminder;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update reminder'
      );
    }
  }
);

export const deleteReminder = createAsyncThunk(
  'reminders/deleteReminder',
  async (reminder: Reminder, { rejectWithValue }) => {
    try {
      await reminderService.deleteReminder(reminder);
      return reminder.id!;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete reminder'
      );
    }
  }
);

export const checkConnection = createAsyncThunk(
  'reminders/checkConnection',
  async (_, { rejectWithValue }) => {
    try {
      const status = await reminderService.checkConnection();
      return status;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to check connection'
      );
    }
  }
);

// Create the slice
const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    // Clear all reminders (e.g., on logout)
    clearReminders: remindersAdapter.removeAll,
    
    // Update connection status
    setConnectionStatus: (
      state,
      action: PayloadAction<{
        connected: boolean;
        permissions: { calendar: boolean; tasks: boolean };
      }>
    ) => {
      state.connectionStatus = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reminders
      .addCase(fetchReminders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        remindersAdapter.setAll(state, action.payload);
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create reminder
      .addCase(createReminder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReminder.fulfilled, (state, action) => {
        remindersAdapter.addOne(state, action.payload);
        state.loading = false;
      })
      .addCase(createReminder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update reminder
      .addCase(updateReminder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReminder.fulfilled, (state, action) => {
        remindersAdapter.updateOne(state, {
          id: action.payload.id!,
          changes: action.payload,
        });
        state.loading = false;
      })
      .addCase(updateReminder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete reminder
      .addCase(deleteReminder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReminder.fulfilled, (state, action) => {
        remindersAdapter.removeOne(state, action.payload);
        state.loading = false;
      })
      .addCase(deleteReminder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Check connection
      .addCase(checkConnection.fulfilled, (state, action) => {
        state.connectionStatus = action.payload;
      });
  },
});

// Export actions
export const { clearReminders, setConnectionStatus, clearError } = remindersSlice.actions;

// Export selectors
export const {
  selectAll: selectAllReminders,
  selectById: selectReminderById,
  selectIds: selectReminderIds,
} = remindersAdapter.getSelectors<RootState>((state) => state.reminders);

// Custom selectors
export const selectRemindersLoading = (state: RootState) => state.reminders.loading;
export const selectRemindersError = (state: RootState) => state.reminders.error;
export const selectConnectionStatus = (state: RootState) => state.reminders.connectionStatus;
export const selectLastFetched = (state: RootState) => state.reminders.lastFetched;

// Filtered selectors
export const selectUpcomingReminders = (state: RootState) => {
  const reminders = selectAllReminders(state);
  const now = new Date();
  return reminders.filter(reminder => new Date(reminder.dateTime) > now);
};

export const selectOverdueReminders = (state: RootState) => {
  const reminders = selectAllReminders(state);
  const now = new Date();
  return reminders.filter(reminder => 
    new Date(reminder.dateTime) <= now && reminder.status === 'pending'
  );
};

export const selectRemindersByType = (state: RootState, type: 'calendar' | 'task') => {
  const reminders = selectAllReminders(state);
  return reminders.filter(reminder => reminder.type === type);
};

export default remindersSlice.reducer;