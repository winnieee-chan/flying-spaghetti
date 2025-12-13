import { create } from "zustand";
import { api } from "../services/api.js";

/**
 * Job Store
 * 
 * Manages job-related state and actions.
 * All async operations go through the api abstraction layer.
 */

const useJobStore = create((set, get) => ({
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
      const jobs = await api.get("/jd");
      set({ jobs, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  /**
   * Create a new job
   * @param {object} jobData - Job data (title, description, company, filters, message)
   */
  createJob: async (jobData) => {
    set({ loading: true, error: null });
    try {
      const newJob = await api.post("/jd", jobData);
      set((state) => ({
        jobs: [...state.jobs, newJob],
        currentJob: newJob,
        filters: newJob.filters,
        loading: false,
      }));
      return newJob;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * Fetch a specific job by ID
   * @param {string} jdId - Job description ID
   */
  fetchJob: async (jdId) => {
    set({ loading: true, error: null });
    try {
      const job = await api.get(`/${jdId}`);
      set({
        currentJob: job,
        filters: job.filters,
        loading: false,
      });
      return job;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * Update filters for a specific job
   * @param {string} jdId - Job description ID
   * @param {object} filters - Updated filters object
   */
  updateFilters: async (jdId, filters) => {
    set({ loading: true, error: null });
    try {
      const updatedJob = await api.put(`/${jdId}`, { filters });
      set((state) => {
        const updatedJobs = state.jobs.map((job) =>
          job.id === jdId ? updatedJob : job
        );
        return {
          jobs: updatedJobs,
          currentJob: state.currentJob?.id === jdId ? updatedJob : state.currentJob,
          filters: updatedJob.filters,
          loading: false,
        };
      });
      return updatedJob;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * Fetch candidates for a specific job
   * @param {string} jdId - Job description ID
   */
  fetchCandidates: async (jdId) => {
    set({ loading: true, error: null });
    try {
      const candidates = await api.get(`/${jdId}/cd`);
      set({ candidates, loading: false });
      return candidates;
    } catch (error) {
      set({ error: error.message, loading: false });
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

