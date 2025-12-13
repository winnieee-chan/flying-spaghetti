import { create } from "zustand";
import { api } from "../services/api.js";
import { filterCandidates, type CandidateFilters } from "../utils/candidateUtils";

/**
 * Job Store
 * 
 * Manages job-related state and actions.
 * All async operations go through the api abstraction layer.
 * Filtering logic is delegated to shared candidateUtils.
 */

interface JobFilters {
  experience?: string[];
  location?: string[];
  skills?: string[];
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color?: string;
}

interface Job {
  id: string;
  title: string;
  description?: string;
  company: string;
  createdAt: string;
  candidateCount?: number;
  filters?: JobFilters;
  message?: string;
  pipelineStages?: PipelineStage[];
}

export interface Message {
  id: string;
  from: "founder" | "candidate";
  content: string;
  timestamp: string;
  aiDrafted?: boolean; // If message was AI-generated
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  experience: string;
  location: string;
  skills: string[];
  resume?: string;
  status: string;
  // New fields
  avatar?: string;           // Profile image URL
  headline?: string;         // e.g. "Senior Engineer at Google"
  source?: 'seeded' | 'external';  // Where candidate came from
  matchScore?: number;       // 0-100 relevance score
  pipelineStage?: "new" | "engaged" | "closing";    // stage id
  // AI fields
  aiFitScore?: number;       // 0-100 AI-calculated fit score
  aiSummary?: string;         // AI-generated fit summary
  aiRecommendation?: "reach_out" | "wait" | "archive" | "advance" | "offer" | "reject";
  conversationHistory?: Message[]; // For engaged stage
}

// CandidateFilters is imported from candidateUtils

interface JobStore {
  // State
  jobs: Job[];
  currentJob: Job | null;
  filters: JobFilters | null;
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  
  // New state
  starredCandidates: Map<string, Set<string>>; // jobId -> Set<candidateId>
  activeFilters: CandidateFilters;
  filteredCandidates: Candidate[];
  selectedCandidate: Candidate | null;
  sidePanelOpen: boolean;
  searchQuery: string; // Search input value

  // Actions
  fetchJobs: () => Promise<void>;
  createJob: (jobData: Partial<Job>) => Promise<Job>;
  fetchJob: (jdId: string) => Promise<Job>;
  updateFilters: (jdId: string, filters: JobFilters) => Promise<Job>;
  fetchCandidates: (jdId: string) => Promise<Candidate[]>;
  clearError: () => void;
  resetCurrentJob: () => void;
  
  // New actions
  toggleStarCandidate: (jobId: string, candidateId: string) => void;
  setActiveFilters: (filters: CandidateFilters) => void;
  selectCandidate: (candidate: Candidate | null) => void;
  setSidePanelOpen: (open: boolean) => void;
  searchExternalCandidates: (jobId: string, query: string) => Promise<Candidate[]>;
  getStarredCandidates: (jobId: string) => Candidate[];
  setSearchQuery: (query: string) => void;
  
  // Pipeline actions
  getPipelineStages: (jobId: string) => PipelineStage[];
  updatePipelineStages: (jobId: string, stages: PipelineStage[]) => Promise<void>;
  updateCandidateStage: (jobId: string, candidateId: string, stageId: string) => Promise<void>;
  batchMoveCandidates: (jobId: string, criteria: { minMatchScore?: number; maxMatchScore?: number }, targetStageId: string) => Promise<number>;
}

const useJobStore = create<JobStore>((set, get) => ({
  // State
  jobs: [],
  currentJob: null,
  filters: null,
  candidates: [],
  loading: false,
  error: null,
  
  // New state
  starredCandidates: new Map(),
  activeFilters: {},
  filteredCandidates: [],
  selectedCandidate: null,
  sidePanelOpen: false,
  searchQuery: "",

  // Actions

  /**
   * Fetch all jobs
   */
  fetchJobs: async () => {
    set({ loading: true, error: null });
    try {
      const jobs = await api.get<Job[]>("/jd");
      set({ jobs, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, loading: false });
    }
  },

  /**
   * Create a new job
   * @param jobData - Job data (title, description, company, filters, message)
   */
  createJob: async (jobData: Partial<Job>) => {
    set({ loading: true, error: null });
    try {
      const newJob = await api.post<Job>("/jd", jobData);
      set((state) => ({
        jobs: [...state.jobs, newJob],
        currentJob: newJob,
        filters: newJob.filters || null,
        loading: false,
      }));
      return newJob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Fetch a specific job by ID
   * @param jdId - Job description ID
   */
  fetchJob: async (jdId: string) => {
    set({ loading: true, error: null });
    try {
      const job = await api.get<Job>(`/${jdId}`);
      set({
        currentJob: job,
        filters: job.filters || null,
        loading: false,
      });
      return job;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Update filters for a specific job
   * @param jdId - Job description ID
   * @param filters - Updated filters object
   */
  updateFilters: async (jdId: string, filters: JobFilters) => {
    set({ loading: true, error: null });
    try {
      const updatedJob = await api.put<Job>(`/${jdId}`, { filters });
      set((state) => {
        const updatedJobs = state.jobs.map((job) =>
          job.id === jdId ? updatedJob : job
        );
        return {
          jobs: updatedJobs,
          currentJob: state.currentJob?.id === jdId ? updatedJob : state.currentJob,
          filters: updatedJob.filters || null,
          loading: false,
        };
      });
      return updatedJob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Fetch candidates for a specific job
   * @param jdId - Job description ID
   */
  fetchCandidates: async (jdId: string) => {
    set({ loading: true, error: null });
    try {
      const candidates = await api.get<Candidate[]>(`/${jdId}/cd`);
      set({ candidates, loading: false });
      
      // Apply existing filters if any
      const { activeFilters } = get();
      if (Object.keys(activeFilters).length > 0) {
        get().setActiveFilters(activeFilters);
      } else {
        set({ filteredCandidates: candidates });
      }
      
      return candidates;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Clear error state
   */
  clearError: () => set({ error: null }),

  /**
   * Reset current job and related state
   */
  resetCurrentJob: () => set({ 
    currentJob: null, 
    filters: null, 
    candidates: [],
    selectedCandidate: null,
    sidePanelOpen: false,
    activeFilters: {},
    filteredCandidates: [],
    searchQuery: "",
  }),

  /**
   * Toggle star status for a candidate in a job
   */
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

  /**
   * Set active filters and compute filtered candidates
   * Filtering logic is delegated to shared candidateUtils
   */
  setActiveFilters: (filters: CandidateFilters) => {
    set({ activeFilters: filters });
    
    // Use shared filtering utility
    const { candidates } = get();
    const filtered = filterCandidates(candidates, filters);
    
    set({ filteredCandidates: filtered });
  },

  /**
   * Select a candidate (opens side panel)
   */
  selectCandidate: (candidate: Candidate | null) => {
    set({ 
      selectedCandidate: candidate,
      sidePanelOpen: candidate !== null,
    });
  },

  /**
   * Set side panel open state
   */
  setSidePanelOpen: (open: boolean) => {
    set({ sidePanelOpen: open });
    if (!open) {
      set({ selectedCandidate: null });
    }
  },

  /**
   * Search external candidates (mock for now)
   */
  searchExternalCandidates: async (jobId: string, query: string) => {
    set({ loading: true, error: null });
    try {
      // This will be handled by the API layer
      const externalCandidates = await api.post<Candidate[]>(`/${jobId}/cd/external-search`, { query });
      
      // Merge with existing candidates
      set((state) => {
        const existingIds = new Set(state.candidates.map(c => c.id));
        const newCandidates = externalCandidates.filter(c => !existingIds.has(c.id));
        const allCandidates = [...state.candidates, ...newCandidates];
        
        // Re-apply filters
        const { activeFilters } = state;
        get().setActiveFilters(activeFilters);
        
        return { 
          candidates: allCandidates,
          loading: false,
        };
      });
      
      return externalCandidates;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Get starred candidates for a job
   */
  getStarredCandidates: (jobId: string) => {
    const { candidates, starredCandidates } = get();
    const starredIds = starredCandidates.get(jobId) || new Set();
    return candidates.filter(c => starredIds.has(c.id));
  },

  /**
   * Set search query
   */
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  /**
   * Get pipeline stages for a job (with defaults)
   */
  getPipelineStages: (jobId: string) => {
    const { currentJob } = get();
    if (currentJob?.id === jobId && currentJob.pipelineStages) {
      return currentJob.pipelineStages.sort((a, b) => a.order - b.order);
    }
    // Default stages - 3-stage pipeline for startups
    return [
      { id: "new", name: "New", order: 0 },
      { id: "engaged", name: "Engaged", order: 1 },
      { id: "closing", name: "Closing", order: 2 },
    ];
  },

  /**
   * Update pipeline stages for a job
   */
  updatePipelineStages: async (jobId: string, stages: PipelineStage[]) => {
    set({ loading: true, error: null });
    try {
      const updatedJob = await api.put<Job>(`/${jobId}`, { pipelineStages: stages });
      set((state) => {
        const updatedJobs = state.jobs.map((job) =>
          job.id === jobId ? updatedJob : job
        );
        return {
          jobs: updatedJobs,
          currentJob: state.currentJob?.id === jobId ? updatedJob : state.currentJob,
          loading: false,
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Update a candidate's pipeline stage
   */
  updateCandidateStage: async (jobId: string, candidateId: string, stageId: string) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/${jobId}/cd/${candidateId}/stage`, { stageId });
      // Update local state
      set((state) => ({
        candidates: state.candidates.map((c) =>
          c.id === candidateId ? { ...c, pipelineStage: stageId } : c
        ),
        filteredCandidates: state.filteredCandidates.map((c) =>
          c.id === candidateId ? { ...c, pipelineStage: stageId } : c
        ),
        selectedCandidate:
          state.selectedCandidate?.id === candidateId
            ? { ...state.selectedCandidate, pipelineStage: stageId }
            : state.selectedCandidate,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Batch move candidates based on match score criteria
   */
  batchMoveCandidates: async (jobId: string, criteria: { minMatchScore?: number; maxMatchScore?: number }, targetStageId: string) => {
    set({ loading: true, error: null });
    try {
      const result = await api.post<{ count: number }>(`/${jobId}/cd/batch-move`, {
        criteria,
        targetStageId,
      });
      // Refresh candidates to get updated stages
      await get().fetchCandidates(jobId);
      set({ loading: false });
      return result.count;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Analyze candidate with AI (Stage 1: New)
   */
  analyzeCandidate: async (jobId: string, candidateId: string) => {
    set({ loading: true, error: null });
    try {
      const result = await api.post<{ fitScore: number; summary: string; recommendation: string; suggestedMessage?: string; confidence: number }>(
        `/${jobId}/cd/${candidateId}/ai/analyze`,
        {}
      );
      
      // Update candidate with AI insights
      set((state) => ({
        candidates: state.candidates.map((c) =>
          c.id === candidateId
            ? { ...c, aiFitScore: result.fitScore, aiSummary: result.summary, aiRecommendation: result.recommendation as any }
            : c
        ),
        loading: false,
      }));
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Draft first message with AI (Stage 1: New)
   */
  draftFirstMessage: async (jobId: string, candidateId: string) => {
    set({ loading: true, error: null });
    try {
      const message = await api.post<string>(`/${jobId}/cd/${candidateId}/ai/draft-message`, {});
      set({ loading: false });
      return message;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Summarize conversation with AI (Stage 2: Engaged)
   */
  summarizeConversation: async (jobId: string, candidateId: string) => {
    set({ loading: true, error: null });
    try {
      const summary = await api.post<string>(`/${jobId}/cd/${candidateId}/ai/summarize-conversation`, {});
      set({ loading: false });
      return summary;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Suggest next message with AI (Stage 2: Engaged)
   */
  suggestNextMessage: async (jobId: string, candidateId: string, lastMessage: string) => {
    set({ loading: true, error: null });
    try {
      const message = await api.post<string>(`/${jobId}/cd/${candidateId}/ai/suggest-message`, { lastMessage });
      set({ loading: false });
      return message;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Suggest interview times (Stage 2: Engaged)
   */
  suggestInterviewTimes: async (jobId: string, candidateId: string) => {
    set({ loading: true, error: null });
    try {
      const times = await api.post<Date[]>(`/${jobId}/cd/${candidateId}/ai/suggest-times`, {});
      set({ loading: false });
      return times;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Draft offer with AI (Stage 3: Closing)
   */
  draftOffer: async (jobId: string, candidateId: string, terms?: Record<string, unknown>) => {
    set({ loading: true, error: null });
    try {
      const offer = await api.post<string>(`/${jobId}/cd/${candidateId}/ai/draft-offer`, { terms });
      set({ loading: false });
      return offer;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Help with negotiation (Stage 3: Closing)
   */
  helpNegotiate: async (jobId: string, candidateId: string, request: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post<string>(`/${jobId}/cd/${candidateId}/ai/negotiate`, { request });
      set({ loading: false });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Generate decision summary (Stage 3: Closing)
   */
  generateDecisionSummary: async (jobId: string, candidateId: string, decision: "hire" | "reject") => {
    set({ loading: true, error: null });
    try {
      const summary = await api.post<string>(`/${jobId}/cd/${candidateId}/ai/decision-summary`, { decision });
      set({ loading: false });
      return summary;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));

export default useJobStore;

