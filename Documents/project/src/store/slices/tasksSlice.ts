import { createSlice, createEntityAdapter, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { getTaskItems, markTaskAsDone } from '../../features/emailManager/api/emailApi';

// Define Task type
export interface Task {
  id: string;
  title: string;
  snippet?: string;
  due: string;
  isDone: boolean;
}

// Create the entity adapter
const tasksAdapter = createEntityAdapter<Task>({
  // Sort tasks by due date (if it's a date string)
  sortComparer: (a, b) => {
    if (a.due === 'Tomorrow' && b.due !== 'Tomorrow') return -1;
    if (a.due !== 'Tomorrow' && b.due === 'Tomorrow') return 1;
    return 0;
  },
});

// Define the initial state using the adapter
const initialState = tasksAdapter.getInitialState({
  loading: false,
  error: null as string | null,
  markingDoneId: null as string | null,
});

// Create the async thunk for fetching tasks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await getTaskItems();
      // Map API response to Task interface
      return tasks.map((task: any) => ({
        id: String(task.id),
        title: task.title,
        snippet: task.snippet || '',
        due: task.due_at ? new Date(task.due_at).toDateString() : '',
        isDone: task.is_done,
      }));
    } catch (error) {
      return rejectWithValue('Failed to load tasks');
    }
  }
);

// Create the async thunk for marking a task as done
export const markTaskDone = createAsyncThunk(
  'tasks/markTaskDone',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await markTaskAsDone(taskId);
      return taskId;
    } catch (error) {
      return rejectWithValue('Failed to mark task as done');
    }
  }
);

// Create the slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Clear tasks (e.g., on logout)
    clearTasks: tasksAdapter.removeAll,
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks cases
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        tasksAdapter.setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch tasks';
      })
      // markTaskDone cases
      .addCase(markTaskDone.pending, (state, action) => {
        state.markingDoneId = action.meta.arg;
      })
      .addCase(markTaskDone.fulfilled, (state, action: PayloadAction<string>) => {
        const taskId = action.payload;
        if (state.entities[taskId]) {
          state.entities[taskId]!.isDone = true;
        }
        state.markingDoneId = null;
      })
      .addCase(markTaskDone.rejected, (state) => {
        state.markingDoneId = null;
      });
  },
});

// Export actions
export const { clearTasks } = tasksSlice.actions;

// Export selectors
export const {
  selectAll: selectAllTasks,
  selectById: selectTaskById,
  selectIds: selectTaskIds,
} = tasksAdapter.getSelectors<RootState>((state) => state.tasks);

// Additional selectors
export const selectTasksLoading = (state: RootState) => state.tasks.loading;
export const selectTasksError = (state: RootState) => state.tasks.error;
export const selectMarkingDoneId = (state: RootState) => state.tasks.markingDoneId;

export default tasksSlice.reducer;