import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FavoritesState {
  favoritesByUser: Record<string, string[]>;
  addFavorite: (slug: string, userId?: string) => void;
  removeFavorite: (slug: string, userId?: string) => void;
  toggleFavorite: (slug: string, userId?: string) => void;
  isFavorite: (slug: string, userId?: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoritesByUser: {},
      addFavorite: (slug, userId = 'guest') => 
        set((state) => {
          const userFavs = state.favoritesByUser[userId] || [];
          if (!userFavs.includes(slug)) {
            return { 
              favoritesByUser: { 
                ...state.favoritesByUser, 
                [userId]: [...userFavs, slug] 
              } 
            };
          }
          return state;
        }),
      removeFavorite: (slug, userId = 'guest') => 
        set((state) => {
          const userFavs = state.favoritesByUser[userId] || [];
          return {
            favoritesByUser: {
              ...state.favoritesByUser,
              [userId]: userFavs.filter((s) => s !== slug)
            }
          };
        }),
      toggleFavorite: (slug, userId = 'guest') =>
        set((state) => {
          const userFavs = state.favoritesByUser[userId] || [];
          if (userFavs.includes(slug)) {
            return { 
              favoritesByUser: { 
                ...state.favoritesByUser, 
                [userId]: userFavs.filter((s) => s !== slug) 
              } 
            };
          }
          return { 
            favoritesByUser: { 
              ...state.favoritesByUser, 
              [userId]: [...userFavs, slug] 
            } 
          };
        }),
      isFavorite: (slug, userId = 'guest') => {
        const userFavs = get().favoritesByUser[userId] || [];
        return userFavs.includes(slug);
      },
    }),
    {
      name: 'eduflow-favorites',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
