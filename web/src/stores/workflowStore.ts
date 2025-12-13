/**
 * Workflow Store
 *
 * Manages workflow states, draft messages, and step tracking.
 */

import { create } from "zustand";
import type { CandidateWorkflowState, HiringDecision, Message, Candidate } from "../types";
import { api } from "../services/api";
import { asyncAction, type AsyncState } from "./helpers";

// ============================================================================
// Types
// ============================================================================

interface WorkflowStore extends AsyncState {
  // State
  workflowStates: Map<string, CandidateWorkflowState>;
  hiringDecisions: HiringDecision[];

  // Actions
  getWorkflowState: (candidateId: string) => CandidateWorkflowState | undefined;
  updateWorkflowStep: (candidateId: string, step: number, completed: boolean) => void;
  saveDraftMessage: (candidateId: string, message: string) => void;
  sendMessage: (
    jobId: string,
    candidateId: string,
    message: string,
    onUpdateCandidate: (candidateId: string, updates: Partial<Candidate>) => void
  ) => Promise<void>;

  // Hiring decisions
  recordHiringDecision: (
    jobId: string,
    candidate: Candidate,
    decision: "hired" | "rejected",
    message?: string
  ) => void;
  getHiringDecisions: (jobId: string) => HiringDecision[];
  getHiredCandidates: (jobId: string) => HiringDecision[];
  getRejectedCandidates: (jobId: string) => HiringDecision[];

  // Utility
  clearError: () => void;
}

// ============================================================================
// Helpers
// ============================================================================

const getDefaultWorkflowState = (candidateId: string): CandidateWorkflowState => ({
  candidateId,
  stage: "new",
  currentStep: 0,
  completedSteps: [],
  notes: "",
});

// ============================================================================
// Store
// ============================================================================

const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  // State
  workflowStates: new Map(),
  hiringDecisions: [],
  loading: false,
  error: null,

  // Actions
  getWorkflowState: (candidateId: string) => {
    return get().workflowStates.get(candidateId);
  },

  updateWorkflowStep: (candidateId: string, step: number, completed: boolean) => {
    set((state) => {
      const newMap = new Map(state.workflowStates);
      const existing = newMap.get(candidateId) || getDefaultWorkflowState(candidateId);

      let completedSteps = [...existing.completedSteps];
      if (completed && !completedSteps.includes(step)) {
        completedSteps.push(step);
      } else if (!completed) {
        completedSteps = completedSteps.filter((s) => s !== step);
      }

      newMap.set(candidateId, {
        ...existing,
        currentStep: step,
        completedSteps,
      });

      return { workflowStates: newMap };
    });
  },

  saveDraftMessage: (candidateId: string, message: string) => {
    set((state) => {
      const newMap = new Map(state.workflowStates);
      const existing = newMap.get(candidateId) || getDefaultWorkflowState(candidateId);

      newMap.set(candidateId, {
        ...existing,
        draftMessage: message,
      });

      return { workflowStates: newMap };
    });
  },

  sendMessage: async (
    jobId: string,
    candidateId: string,
    message: string,
    onUpdateCandidate: (candidateId: string, updates: Partial<Candidate>) => void
  ) => {
    return asyncAction(set, async () => {
      await api.post(`/${jobId}/cd/${candidateId}/messages`, { content: message });

      // Create new message
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        from: "founder",
        content: message,
        timestamp: new Date().toISOString(),
        aiDrafted: true,
      };

      // Update candidate conversation history via callback
      onUpdateCandidate(candidateId, {
        conversationHistory: [newMessage], // Will be merged in candidate store
      });

      // Clear draft message
      set((state) => {
        const newWorkflowStates = new Map(state.workflowStates);
        const existing = newWorkflowStates.get(candidateId);
        if (existing) {
          newWorkflowStates.set(candidateId, {
            ...existing,
            draftMessage: undefined,
          });
        }
        return { workflowStates: newWorkflowStates };
      });
    });
  },

  recordHiringDecision: (
    jobId: string,
    candidate: Candidate,
    decision: "hired" | "rejected",
    message?: string
  ) => {
    const newDecision: HiringDecision = {
      id: `decision-${Date.now()}`,
      jobId,
      candidateId: candidate.id,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      candidateHeadline: candidate.headline,
      decision,
      decisionDate: new Date().toISOString(),
      fitScore: candidate.aiFitScore || candidate.matchScore,
      offerMessage: decision === "hired" ? message : undefined,
      rejectionMessage: decision === "rejected" ? message : undefined,
      feedbackSent: !!message,
    };

    set((state) => ({
      hiringDecisions: [...state.hiringDecisions, newDecision],
    }));
  },

  getHiringDecisions: (jobId: string) => {
    return get().hiringDecisions.filter((d) => d.jobId === jobId);
  },

  getHiredCandidates: (jobId: string) => {
    return get().hiringDecisions.filter(
      (d) => d.jobId === jobId && d.decision === "hired"
    );
  },

  getRejectedCandidates: (jobId: string) => {
    return get().hiringDecisions.filter(
      (d) => d.jobId === jobId && d.decision === "rejected"
    );
  },

  clearError: () => set({ error: null }),
}));

export default useWorkflowStore;

