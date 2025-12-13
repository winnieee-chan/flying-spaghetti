/**
 * Candidate Store
 *
 * Manages candidate data, filtering, starring, and pipeline stages.
 */

import { create } from "zustand";
import type { Candidate, CandidateFilters, PipelineStage } from "../types";
import { api } from "../services/api";
import { filterCandidates as filterCandidatesUtil } from "../utils/candidateUtils";
import { asyncAction, type AsyncState } from "./helpers";

// ============================================================================
// Types
// ============================================================================

interface CandidateStore extends AsyncState {
  // State
  candidates: Candidate[];
  filteredCandidates: Candidate[];
  activeFilters: CandidateFilters;
  starredCandidates: Map<string, Set<string>>; // jobId -> Set<candidateId>

  // Actions
  fetchCandidates: (jdId: string) => Promise<Candidate[]>;
  searchCandidates: (
    jobId: string,
    query: string,
    filters?: {
      skills?: string[];
      location?: string;
      minExperience?: number;
      openToWork?: boolean;
    }
  ) => Promise<Candidate[]>;
  setActiveFilters: (filters: CandidateFilters) => void;
  toggleStarCandidate: (jobId: string, candidateId: string) => void;
  getStarredCandidates: (jobId: string) => Candidate[];
  searchExternalCandidates: (jobId: string, query: string) => Promise<Candidate[]>;

  // Pipeline actions
  updateCandidateStage: (
    jobId: string,
    candidateId: string,
    stageId: string
  ) => Promise<void>;
  batchMoveCandidates: (
    jobId: string,
    criteria: { minMatchScore?: number; maxMatchScore?: number },
    targetStageId: string
  ) => Promise<number>;

  // Internal
  updateCandidate: (candidateId: string, updates: Partial<Candidate>) => void;
  clearCandidates: () => void;
  clearError: () => void;
}

// ============================================================================
// Default Pipeline Stages
// ============================================================================

export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  { id: "new", name: "New", order: 0 },
  { id: "engaged", name: "Engaged", order: 1 },
  { id: "closing", name: "Closing", order: 2 },
];

// ============================================================================
// Store
// ============================================================================

const useCandidateStore = create<CandidateStore>((set, get) => ({
  // State
  candidates: [],
  filteredCandidates: [],
  activeFilters: {},
  starredCandidates: new Map(),
  loading: false,
  error: null,

  // Actions
  fetchCandidates: async (jdId: string) => {
    return asyncAction(set, async () => {
      const candidates = await api.get<Candidate[]>(`/${jdId}/cd`);
      set({ candidates });

      // Apply existing filters
      const { activeFilters } = get();
      if (Object.keys(activeFilters).length > 0) {
        const filtered = filterCandidatesUtil(candidates, activeFilters);
        set({ filteredCandidates: filtered });
      } else {
        set({ filteredCandidates: candidates });
      }

      return candidates;
    });
  },

  searchCandidates: async (
    jobId: string,
    query: string,
    filters?: {
      skills?: string[];
      location?: string;
      minExperience?: number;
      openToWork?: boolean;
    }
  ) => {
    return asyncAction(set, async () => {
      const searchResults = await api.post<Candidate[]>(
        `/${jobId}/cd/search`,
        {
          query,
          ...filters,
        }
      );

      // Update filtered candidates with search results
      set({ filteredCandidates: searchResults });

      return searchResults;
    });
  },

  setActiveFilters: (filters: CandidateFilters) => {
    set({ activeFilters: filters });
    const { candidates } = get();
    const filtered = filterCandidatesUtil(candidates, filters);
    set({ filteredCandidates: filtered });
  },

  toggleStarCandidate: (jobId: string, candidateId: string) => {
    set((state) => {
      const starred = state.starredCandidates.get(jobId) || new Set<string>();
      const newStarred = new Set(starred);

      if (newStarred.has(candidateId)) {
        newStarred.delete(candidateId);
      } else {
        newStarred.add(candidateId);
      }

      const newMap = new Map(state.starredCandidates);
      newMap.set(jobId, newStarred);

      return { starredCandidates: newMap };
    });
  },

  getStarredCandidates: (jobId: string) => {
    const { candidates, starredCandidates } = get();
    const starredIds = starredCandidates.get(jobId) || new Set();
    return candidates.filter((c) => starredIds.has(c.id));
  },

  searchExternalCandidates: async (jobId: string, query: string) => {
    return asyncAction(set, async () => {
      const externalCandidates = await api.post<Candidate[]>(
        `/${jobId}/cd/external-search`,
        { query }
      );

      set((state) => {
        const existingIds = new Set(state.candidates.map((c) => c.id));
        const newCandidates = externalCandidates.filter(
          (c) => !existingIds.has(c.id)
        );
        const allCandidates = [...state.candidates, ...newCandidates];

        // Re-apply filters
        const { activeFilters } = state;
        const filtered = filterCandidatesUtil(allCandidates, activeFilters);

        return {
          candidates: allCandidates,
          filteredCandidates: filtered,
        };
      });

      return externalCandidates;
    });
  },

  updateCandidateStage: async (
    jobId: string,
    candidateId: string,
    stageId: string
  ) => {
    return asyncAction(set, async () => {
      await api.put(`/${jobId}/cd/${candidateId}/stage`, { stageId });

      const updatedStage = stageId as Candidate["pipelineStage"];
      set((state) => ({
        candidates: state.candidates.map((c) =>
          c.id === candidateId ? { ...c, pipelineStage: updatedStage } : c
        ),
        filteredCandidates: state.filteredCandidates.map((c) =>
          c.id === candidateId ? { ...c, pipelineStage: updatedStage } : c
        ),
      }));
    });
  },

  batchMoveCandidates: async (
    jobId: string,
    criteria: { minMatchScore?: number; maxMatchScore?: number },
    targetStageId: string
  ) => {
    return asyncAction(set, async () => {
      const result = await api.post<{ count: number }>(
        `/${jobId}/cd/batch-move`,
        { criteria, targetStageId }
      );

      // Refresh candidates
      await get().fetchCandidates(jobId);

      return result.count;
    });
  },

  updateCandidate: (candidateId: string, updates: Partial<Candidate>) => {
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.id === candidateId ? { ...c, ...updates } : c
      ),
      filteredCandidates: state.filteredCandidates.map((c) =>
        c.id === candidateId ? { ...c, ...updates } : c
      ),
    }));
  },

  clearCandidates: () => {
    set({
      candidates: [],
      filteredCandidates: [],
      activeFilters: {},
    });
  },

  clearError: () => set({ error: null }),
}));

export default useCandidateStore;

