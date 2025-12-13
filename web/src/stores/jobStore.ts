/**
 * Job Store
 *
 * Manages job-related state: jobs list, current job, job CRUD.
 * For candidates, see candidateStore. For UI state, see uiStore.
 *
 * This file also re-exports from other stores for backwards compatibility.
 */

import { create } from "zustand";
import type {
  Job,
  JobFilters,
  PipelineStage,
  Candidate,
  CandidateFilters,
  CandidateWorkflowState,
  HiringDecision,
  Message,
} from "../types";
import { api } from "../services/api";
import { asyncAction, type AsyncState } from "./helpers";

// Re-export types for backwards compatibility
export type { Job, JobFilters, PipelineStage, Candidate, CandidateFilters, Message, CandidateWorkflowState, HiringDecision };

// Import other stores for combined store
import useCandidateStore, { DEFAULT_PIPELINE_STAGES } from "./candidateStore";
import useUIStore from "./uiStore";
import useWorkflowStore from "./workflowStore";
import useAIStore from "./aiStore";

// ============================================================================
// Types
// ============================================================================

interface JobStore extends AsyncState {
  // State
  jobs: Job[];
  currentJob: Job | null;
  filters: JobFilters | null;

  // Actions
  fetchJobs: () => Promise<void>;
  createJob: (jobData: Partial<Job>) => Promise<Job>;
  fetchJob: (jdId: string) => Promise<Job>;
  updateFilters: (jdId: string, filters: JobFilters) => Promise<Job>;
  updatePipelineStages: (jobId: string, stages: PipelineStage[]) => Promise<void>;
  getPipelineStages: (jobId: string) => PipelineStage[];

  // Utility
  clearError: () => void;
  resetCurrentJob: () => void;
}

// ============================================================================
// Store
// ============================================================================

const useJobStoreBase = create<JobStore>((set, get) => ({
  // State
  jobs: [],
  currentJob: null,
  filters: null,
  loading: false,
  error: null,

  // Actions
  fetchJobs: async () => {
    return asyncAction(set, async () => {
      const jobs = await api.get<Job[]>("/jd");
      set({ jobs });
    });
  },

  createJob: async (jobData: Partial<Job>) => {
    return asyncAction(set, async () => {
      const newJob = await api.post<Job>("/jd", jobData);
      set((state) => ({
        jobs: [...state.jobs, newJob],
        currentJob: newJob,
        filters: newJob.filters || null,
      }));
      return newJob;
    });
  },

  fetchJob: async (jdId: string) => {
    return asyncAction(set, async () => {
      const job = await api.get<Job>(`/${jdId}`);
      set({
        currentJob: job,
        filters: job.filters || null,
      });
      return job;
    });
  },

  updateFilters: async (jdId: string, filters: JobFilters) => {
    return asyncAction(set, async () => {
      const updatedJob = await api.put<Job>(`/${jdId}`, { filters });
      set((state) => ({
        jobs: state.jobs.map((job) =>
          job.id === jdId ? updatedJob : job
        ),
        currentJob:
          state.currentJob?.id === jdId ? updatedJob : state.currentJob,
        filters: updatedJob.filters || null,
      }));
      return updatedJob;
    });
  },

  updatePipelineStages: async (jobId: string, stages: PipelineStage[]) => {
    return asyncAction(set, async () => {
      const updatedJob = await api.put<Job>(`/${jobId}`, {
        pipelineStages: stages,
      });
      set((state) => ({
        jobs: state.jobs.map((job) =>
          job.id === jobId ? updatedJob : job
        ),
        currentJob:
          state.currentJob?.id === jobId ? updatedJob : state.currentJob,
      }));
    });
  },

  getPipelineStages: (jobId: string) => {
    const { currentJob } = get();
    if (currentJob?.id === jobId && currentJob.pipelineStages) {
      return currentJob.pipelineStages.sort((a, b) => a.order - b.order);
    }
    return DEFAULT_PIPELINE_STAGES;
  },

  clearError: () => set({ error: null }),

  resetCurrentJob: () => {
    set({
      currentJob: null,
      filters: null,
    });
    // Also reset related stores
    useCandidateStore.getState().clearCandidates();
    useUIStore.getState().resetUI();
  },
}));

// ============================================================================
// Combined Store (Backwards Compatibility)
// ============================================================================

/**
 * Combined hook that provides backwards compatibility with the old monolithic store.
 * Aggregates state and actions from all split stores.
 */
const useJobStore = () => {
  const jobStore = useJobStoreBase();
  const candidateStore = useCandidateStore();
  const uiStore = useUIStore();
  const workflowStore = useWorkflowStore();
  const aiStore = useAIStore();

  // Combine loading states
  const loading =
    jobStore.loading ||
    candidateStore.loading ||
    workflowStore.loading ||
    aiStore.loading;

  // Combine errors (use first non-null error)
  const error =
    jobStore.error ||
    candidateStore.error ||
    workflowStore.error ||
    aiStore.error;

  return {
    // Job state
    jobs: jobStore.jobs,
    currentJob: jobStore.currentJob,
    filters: jobStore.filters,

    // Candidate state
    candidates: candidateStore.candidates,
    filteredCandidates: candidateStore.filteredCandidates,
    activeFilters: candidateStore.activeFilters,
    starredCandidates: candidateStore.starredCandidates,

    // UI state
    selectedCandidate: uiStore.selectedCandidate,
    sidePanelOpen: uiStore.sidePanelOpen,
    searchQuery: uiStore.searchQuery,

    // Workflow state
    workflowStates: workflowStore.workflowStates,
    hiringDecisions: workflowStore.hiringDecisions,

    // Combined state
    loading,
    error,

    // Job actions
    fetchJobs: jobStore.fetchJobs,
    createJob: jobStore.createJob,
    fetchJob: jobStore.fetchJob,
    updateFilters: jobStore.updateFilters,
    updatePipelineStages: jobStore.updatePipelineStages,
    getPipelineStages: jobStore.getPipelineStages,
    resetCurrentJob: jobStore.resetCurrentJob,

    // Candidate actions
    fetchCandidates: candidateStore.fetchCandidates,
    setActiveFilters: candidateStore.setActiveFilters,
    toggleStarCandidate: candidateStore.toggleStarCandidate,
    getStarredCandidates: candidateStore.getStarredCandidates,
    searchExternalCandidates: candidateStore.searchExternalCandidates,
    searchCandidates: candidateStore.searchCandidates,
    updateCandidateStage: candidateStore.updateCandidateStage,
    batchMoveCandidates: candidateStore.batchMoveCandidates,

    // UI actions
    selectCandidate: uiStore.selectCandidate,
    setSidePanelOpen: uiStore.setSidePanelOpen,
    setSearchQuery: uiStore.setSearchQuery,

    // Workflow actions
    getWorkflowState: workflowStore.getWorkflowState,
    updateWorkflowStep: workflowStore.updateWorkflowStep,
    saveDraftMessage: workflowStore.saveDraftMessage,
    sendMessage: (jobId: string, candidateId: string, message: string) =>
      workflowStore.sendMessage(
        jobId,
        candidateId,
        message,
        candidateStore.updateCandidate
      ),
    recordHiringDecision: (
      jobId: string,
      candidateId: string,
      decision: "hired" | "rejected",
      message?: string
    ) => {
      const candidate = candidateStore.candidates.find(
        (c) => c.id === candidateId
      );
      if (candidate) {
        workflowStore.recordHiringDecision(jobId, candidate, decision, message);
        // Remove from pipeline
        candidateStore.updateCandidate(candidateId, {
          pipelineStage: undefined,
        });
      }
    },
    getHiringDecisions: workflowStore.getHiringDecisions,
    getHiredCandidates: workflowStore.getHiredCandidates,
    getRejectedCandidates: workflowStore.getRejectedCandidates,

    // AI actions
    analyzeCandidate: (jobId: string, candidateId: string) =>
      aiStore.analyzeCandidate(
        jobId,
        candidateId,
        candidateStore.updateCandidate
      ),
    draftFirstMessage: aiStore.draftFirstMessage,
    summarizeConversation: aiStore.summarizeConversation,
    suggestNextMessage: aiStore.suggestNextMessage,
    suggestInterviewTimes: aiStore.suggestInterviewTimes,
    draftOffer: aiStore.draftOffer,
    helpNegotiate: aiStore.helpNegotiate,
    generateDecisionSummary: aiStore.generateDecisionSummary,

    // Clear combined errors
    clearError: () => {
      jobStore.clearError();
      candidateStore.clearError();
      workflowStore.clearError();
      aiStore.clearError();
    },
  };
};

export default useJobStore;

// Also export the base store for direct access
export { useJobStoreBase };
