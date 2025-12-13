/**
 * UI Store
 *
 * Manages UI state: side panel, selected candidate, search query.
 */

import { create } from "zustand";
import type { Candidate } from "../types";

// ============================================================================
// Types
// ============================================================================

interface UIStore {
  // State
  selectedCandidate: Candidate | null;
  sidePanelOpen: boolean;
  searchQuery: string;

  // Actions
  selectCandidate: (candidate: Candidate | null) => void;
  setSidePanelOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  resetUI: () => void;
}

// ============================================================================
// Store
// ============================================================================

const useUIStore = create<UIStore>((set) => ({
  // State
  selectedCandidate: null,
  sidePanelOpen: false,
  searchQuery: "",

  // Actions
  selectCandidate: (candidate: Candidate | null) => {
    set({
      selectedCandidate: candidate,
      sidePanelOpen: candidate !== null,
    });
  },

  setSidePanelOpen: (open: boolean) => {
    set({ sidePanelOpen: open });
    if (!open) {
      set({ selectedCandidate: null });
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  resetUI: () => {
    set({
      selectedCandidate: null,
      sidePanelOpen: false,
      searchQuery: "",
    });
  },
}));

export default useUIStore;

