/**
 * Stores Index
 *
 * Central export for all stores.
 */

// Main combined store (backwards compatible)
export { default as useJobStore, useJobStoreBase } from "./jobStore";

// Individual stores
export { default as useCandidateStore, DEFAULT_PIPELINE_STAGES } from "./candidateStore";
export { default as useUIStore } from "./uiStore";
export { default as useWorkflowStore } from "./workflowStore";
export { default as useAIStore } from "./aiStore";

// Helpers
export { asyncAction, asyncActionSafe, clearError, setError } from "./helpers";
export type { AsyncState } from "./helpers";

// Re-export types for convenience
export type {
  Job,
  JobFilters,
  PipelineStage,
  Candidate,
  CandidateFilters,
  Message,
  CandidateWorkflowState,
  HiringDecision,
  AIAnalysisResult,
} from "../types";

