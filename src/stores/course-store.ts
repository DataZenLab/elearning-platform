import { create } from 'zustand';
import type { CourseDifficulty } from '@/types';

interface CourseFilters {
  search: string;
  category: string;
  difficulty: CourseDifficulty | '';
  sort: string;
  page: number;
}

interface CourseStoreState {
  filters: CourseFilters;
  isSidebarOpen: boolean;
  viewMode: 'grid' | 'list';

  // Actions
  setSearch: (search: string) => void;
  setCategory: (category: string) => void;
  setDifficulty: (difficulty: CourseDifficulty | '') => void;
  setSort: (sort: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
  toggleSidebar: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
}

const defaultFilters: CourseFilters = {
  search: '',
  category: '',
  difficulty: '',
  sort: 'newest',
  page: 1,
};

export const useCourseStore = create<CourseStoreState>((set) => ({
  filters: { ...defaultFilters },
  isSidebarOpen: false,
  viewMode: 'grid',

  setSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search, page: 1 },
    })),

  setCategory: (category) =>
    set((state) => ({
      filters: { ...state.filters, category, page: 1 },
    })),

  setDifficulty: (difficulty) =>
    set((state) => ({
      filters: { ...state.filters, difficulty, page: 1 },
    })),

  setSort: (sort) =>
    set((state) => ({
      filters: { ...state.filters, sort, page: 1 },
    })),

  setPage: (page) =>
    set((state) => ({
      filters: { ...state.filters, page },
    })),

  resetFilters: () => set({ filters: { ...defaultFilters } }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setViewMode: (viewMode) => set({ viewMode }),
}));
