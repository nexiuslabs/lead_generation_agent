import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProfileState {
  displayName: string;
  email: string;
  officeLocation: string;
  theme: 'light' | 'dark';
  language: string;
  avatar: string; // filename or URL
}

const initialState: ProfileState = {
  displayName: '',
  email: '',
  officeLocation: '',
  theme: 'light',
  language: 'en',
  avatar: ''
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Partial<ProfileState>>) => {
      return { ...state, ...action.payload };
    },
    updateProfileField: (
      state,
      action: PayloadAction<{ field: keyof ProfileState; value: any }>
    ) => {
      const { field, value } = action.payload;
      state[field] = value;
    }
  }
});

export const { setProfile, updateProfileField } = profileSlice.actions;
export default profileSlice.reducer;
