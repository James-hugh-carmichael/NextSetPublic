import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FilterState {
  genres: string[];
  commitment: string[];
  location: string;
  roles: string[];
  age: number;

  toggleGenre: (genre: string) => void;
  toggleRole: (role: string) => void;
  toggleCommitment: (option: string) => void;
  setLocation: (location: string) => void;
  setAge: (age: number) => void;
  clearFilters: () => void;
}

const initialState = {
  genres: [] as string[],
  commitment: [] as string[],
  location: "",
  roles: [] as string[],
  age: 16,
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      ...initialState,

      toggleGenre: (genre) =>
        set((state) => ({
          genres: state.genres.includes(genre)
            ? state.genres.filter((g) => g !== genre)
            : [...state.genres, genre],
        })),

      toggleRole: (role) =>
        set((state) => ({
          roles: state.roles.includes(role)
            ? state.roles.filter((r) => r !== role)
            : [...state.roles, role],
        })),

      toggleCommitment: (option) =>
        set((state) => ({
          commitment: state.commitment.includes(option)
            ? state.commitment.filter((c) => c !== option)
            : [...state.commitment, option],
        })),

      setLocation: (location) => set({ location }),
      setAge: (age) => set({ age }),

      clearFilters: () => set({ ...initialState }),
    }),
    {
      name: "band-filter-storage", 
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useActiveFilterCount = () =>
  useFilterStore(
    (state) =>
      state.genres.length +
      state.commitment.length +
      (state.location ? 1 : 0) +
      state.roles.length
  );