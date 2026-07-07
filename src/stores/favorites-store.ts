import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FavoritesState {
  favoriteSlugs: string[];
  addFavorite: (slug: string) => void;
  removeFavorite: (slug: string) => void;
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteSlugs: [],
      addFavorite: (slug) => 
        set((state) => {
          if (!state.favoriteSlugs.includes(slug)) {
            return { favoriteSlugs: [...state.favoriteSlugs, slug] };
          }
          return state;
        }),
      removeFavorite: (slug) => 
        set((state) => ({
          favoriteSlugs: state.favoriteSlugs.filter((s) => s !== slug)
        })),
      toggleFavorite: (slug) =>
        set((state) => {
          if (state.favoriteSlugs.includes(slug)) {
            return { favoriteSlugs: state.favoriteSlugs.filter((s) => s !== slug) };
          }
          return { favoriteSlugs: [...state.favoriteSlugs, slug] };
        }),
      isFavorite: (slug) => get().favoriteSlugs.includes(slug),
    }),
    {
      name: 'eduflow-favorites',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
