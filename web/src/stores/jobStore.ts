import { create } from "zustand";
import { api } from "../services/api.js";

/**
 * Job Store
 * 
 * Manages job-related state and actions.
 * All async operations go through the api abstraction layer.
 */

interface JobFilters {
  experience?: string[];
  location?: string[];
  skills?: string[];
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
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  experience: string;
  location: string;
  skills: string[];
  resume?: string;
  status: string;
}

interface JobStore {
  // State
  jobs: Job[];
  currentJob: Job | null;
  filters: JobFilters | null;
  candidates: Candidate[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchJobs: () => Promise<void>;
  createJob: (jobData: Partial<Job>) => Promise<Job>;
  fetchJob: (jdId: string) => Promise<Job>;
  updateFilters: (jdId: string, filters: JobFilters) => Promise<Job>;
  fetchCandidates: (jdId: string) => Promise<Candidate[]>;
  clearError: () => void;
  resetCurrentJob: () => void;
}

const useJobStore = create<JobStore>((set, get) => ({
  // State
  jobs: [],
  currentJob: null,
  filters: null,
  candidates: [],
  loading: false,
  error: null,

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
  resetCurrentJob: () => set({ currentJob: null, filters: null, candidates: [] }),
}));

export default useJobStore;

