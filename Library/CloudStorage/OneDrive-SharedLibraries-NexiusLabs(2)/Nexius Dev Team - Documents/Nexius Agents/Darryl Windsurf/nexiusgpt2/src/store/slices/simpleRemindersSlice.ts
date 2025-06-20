import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Reminder {
  id: number;
  title: string;
  datetime: string; // ISO string
}

export interface SimpleRemindersState {
  items: Reminder[];
}

const initialState: SimpleRemindersState = {
  items: [],
};

const simpleRemindersSlice = createSlice({
  name: 'simpleReminders',
  initialState,
  reducers: {
    setReminders(state, action: PayloadAction<Reminder[]>) {
      state.items = action.payload;
    },
    addReminder(state, action: PayloadAction<Reminder>) {
      state.items.push(action.payload);
    },
  },
});

export const { setReminders, addReminder } = simpleRemindersSlice.actions;
export default simpleRemindersSlice.reducer;
