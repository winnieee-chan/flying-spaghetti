/**
 * AI Store
 *
 * Manages AI-powered actions: analysis, drafting, suggestions.
 */

import { create } from "zustand";
import type { Candidate, AIAnalysisResult } from "../types";
import { api } from "../services/api";
import { asyncAction, type AsyncState } from "./helpers";

// ============================================================================
// Types
// ============================================================================

interface AIStore extends AsyncState {
  // Actions
  analyzeCandidate: (
    jobId: string,
    candidateId: string,
    onUpdateCandidate: (candidateId: string, updates: Partial<Candidate>) => void
  ) => Promise<AIAnalysisResult>;
  draftFirstMessage: (jobId: string, candidateId: string) => Promise<string>;
  summarizeConversation: (jobId: string, candidateId: string) => Promise<string>;
  suggestNextMessage: (
    jobId: string,
    candidateId: string,
    lastMessage: string
  ) => Promise<string>;
  suggestInterviewTimes: (jobId: string, candidateId: string) => Promise<Date[]>;
  draftOffer: (
    jobId: string,
    candidateId: string,
    terms?: Record<string, unknown>
  ) => Promise<string>;
  helpNegotiate: (
    jobId: string,
    candidateId: string,
    request: string
  ) => Promise<string>;
  generateDecisionSummary: (
    jobId: string,
    candidateId: string,
    decision: "hire" | "reject"
  ) => Promise<string>;

  // Utility
  clearError: () => void;
}

// ============================================================================
// Store
// ============================================================================

const useAIStore = create<AIStore>((set) => ({
  // State
  loading: false,
  error: null,

  // Actions
  analyzeCandidate: async (
    jobId: string,
    candidateId: string,
    onUpdateCandidate: (candidateId: string, updates: Partial<Candidate>) => void
  ) => {
    return asyncAction(set, async () => {
      const result = await api.post<AIAnalysisResult>(
        `/${jobId}/cd/${candidateId}/ai/analyze`,
        {}
      );

      // Update candidate with AI insights via callback
      onUpdateCandidate(candidateId, {
        aiFitScore: result.fitScore,
        aiSummary: result.summary,
        aiRecommendation: result.recommendation as Candidate["aiRecommendation"],
      });

      return result;
    });
  },

  draftFirstMessage: async (jobId: string, candidateId: string) => {
    return asyncAction(set, async () => {
      const message = await api.post<string>(
        `/${jobId}/cd/${candidateId}/ai/draft-message`,
        {}
      );
      return message;
    });
  },

  summarizeConversation: async (jobId: string, candidateId: string) => {
    return asyncAction(set, async () => {
      const summary = await api.post<string>(
        `/${jobId}/cd/${candidateId}/ai/summarize-conversation`,
        {}
      );
      return summary;
    });
  },

  suggestNextMessage: async (
    jobId: string,
    candidateId: string,
    lastMessage: string
  ) => {
    return asyncAction(set, async () => {
      const message = await api.post<string>(
        `/${jobId}/cd/${candidateId}/ai/suggest-message`,
        { lastMessage }
      );
      return message;
    });
  },

  suggestInterviewTimes: async (jobId: string, candidateId: string) => {
    return asyncAction(set, async () => {
      const times = await api.post<Date[]>(
        `/${jobId}/cd/${candidateId}/ai/suggest-times`,
        {}
      );
      return times;
    });
  },

  draftOffer: async (
    jobId: string,
    candidateId: string,
    terms?: Record<string, unknown>
  ) => {
    return asyncAction(set, async () => {
      const offer = await api.post<string>(
        `/${jobId}/cd/${candidateId}/ai/draft-offer`,
        { terms }
      );
      return offer;
    });
  },

  helpNegotiate: async (
    jobId: string,
    candidateId: string,
    request: string
  ) => {
    return asyncAction(set, async () => {
      const response = await api.post<string>(
        `/${jobId}/cd/${candidateId}/ai/negotiate`,
        { request }
      );
      return response;
    });
  },

  generateDecisionSummary: async (
    jobId: string,
    candidateId: string,
    decision: "hire" | "reject"
  ) => {
    return asyncAction(set, async () => {
      const summary = await api.post<string>(
        `/${jobId}/cd/${candidateId}/ai/decision-summary`,
        { decision }
      );
      return summary;
    });
  },

  clearError: () => set({ error: null }),
}));

export default useAIStore;

