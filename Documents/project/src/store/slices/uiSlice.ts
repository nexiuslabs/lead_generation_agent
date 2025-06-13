import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

interface UiState {
  theme: 'light' | 'dark' | 'system';
  sidebar: {
    isOpen: boolean;
    isCollapsed: boolean;
    activeSection: string | null;
  };
  preview: {
    isVisible: boolean;
    isCollapsed: boolean;
    url: string;
  };
  modal: {
    isOpen: boolean;
    type: string | null;
    data: any;
  };
  search: {
    isOpen: boolean;
    query: string;
  };
  toast: {
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  };
  lastUserActivity: number;
}

const initialState: UiState = {
  theme: 'system',
  sidebar: {
    isOpen: true,
    isCollapsed: false,
    activeSection: null,
  },
  preview: {
    isVisible: false,
    isCollapsed: false,
    url: 'https://example.com',
  },
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  search: {
    isOpen: false,
    query: '',
  },
  toast: {
    isVisible: false,
    message: '',
    type: 'info',
  },
  lastUserActivity: Date.now(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },

    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isOpen = action.payload;
    },
    toggleSidebarCollapse: (state) => {
      state.sidebar.isCollapsed = !state.sidebar.isCollapsed;
    },
    setSidebarActiveSection: (state, action: PayloadAction<string | null>) => {
      state.sidebar.activeSection = action.payload;
    },

    // Preview actions
    togglePreview: (state) => {
      state.preview.isVisible = !state.preview.isVisible;
    },
    setPreviewVisible: (state, action: PayloadAction<boolean>) => {
      state.preview.isVisible = action.payload;
    },
    togglePreviewCollapse: (state) => {
      state.preview.isCollapsed = !state.preview.isCollapsed;
    },
    setPreviewUrl: (state, action: PayloadAction<string>) => {
      state.preview.url = action.payload;
    },

    // Modal actions
    openModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
      state.modal.isOpen = true;
      state.modal.type = action.payload.type;
      state.modal.data = action.payload.data || null;
    },
    closeModal: (state) => {
      state.modal.isOpen = false;
      state.modal.type = null;
      state.modal.data = null;
    },

    // Search actions
    toggleSearch: (state) => {
      state.search.isOpen = !state.search.isOpen;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.search.query = action.payload;
    },

    // Toast actions
    showToast: (
      state,
      action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' | 'warning' }>
    ) => {
      state.toast.isVisible = true;
      state.toast.message = action.payload.message;
      state.toast.type = action.payload.type;
    },
    hideToast: (state) => {
      state.toast.isVisible = false;
    },

    // User activity
    updateLastUserActivity: (state) => {
      state.lastUserActivity = Date.now();
    },
  },
});

// Export actions
export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapse,
  setSidebarActiveSection,
  togglePreview,
  setPreviewVisible,
  togglePreviewCollapse,
  setPreviewUrl,
  openModal,
  closeModal,
  toggleSearch,
  setSearchQuery,
  showToast,
  hideToast,
  updateLastUserActivity,
} = uiSlice.actions;

// Export selectors
export const selectTheme = (state: RootState) => state.ui.theme;
export const selectSidebar = (state: RootState) => state.ui.sidebar;
export const selectPreview = (state: RootState) => state.ui.preview;
export const selectModal = (state: RootState) => state.ui.modal;
export const selectSearch = (state: RootState) => state.ui.search;
export const selectToast = (state: RootState) => state.ui.toast;
export const selectLastUserActivity = (state: RootState) => state.ui.lastUserActivity;

export default uiSlice.reducer;