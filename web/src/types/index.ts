/**
 * Shared Types
 *
 * Central type definitions used across stores and services.
 */

// ============================================================================
// Job Types
// ============================================================================

export interface JobFilters {
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

export interface Job {
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

// ============================================================================
// Candidate Types
// ============================================================================

export interface Message {
  id: string;
  from: "founder" | "candidate";
  content: string;
  timestamp: string;
  aiDrafted?: boolean;
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
  avatar?: string;
  headline?: string;
  source?: "seeded" | "external";
  matchScore?: number;
  pipelineStage?: "new" | "engaged" | "closing";
  aiFitScore?: number;
  aiSummary?: string;
  aiRecommendation?:
    | "reach_out"
    | "wait"
    | "archive"
    | "advance"
    | "offer"
    | "reject";
  conversationHistory?: Message[];
}

// ============================================================================
// Filter Types
// ============================================================================

export interface CandidateFilters {
  keywords?: string[];
  skills?: string[];
  experience?: string[];
  location?: string[];
  minMatchScore?: number;
}

// ============================================================================
// Workflow Types
// ============================================================================

export interface CandidateWorkflowState {
  candidateId: string;
  stage: "new" | "engaged" | "closing";
  currentStep: number;
  completedSteps: number[];
  draftMessage?: string;
  scheduledInterview?: string;
  decision?: "hire" | "reject" | null;
  notes: string;
}

export interface HiringDecision {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateHeadline?: string;
  decision: "hired" | "rejected";
  decisionDate: string;
  fitScore?: number;
  offerMessage?: string;
  rejectionMessage?: string;
  feedbackSent: boolean;
  notes?: string;
}

// ============================================================================
// AI Types
// ============================================================================

export interface AIAnalysisResult {
  fitScore: number;
  summary: string;
  recommendation: string;
  suggestedMessage?: string;
  confidence: number;
}

// ============================================================================
// API Types
// ============================================================================

export interface ApiAdapter {
  get<T = unknown>(path: string): Promise<T>;
  post<T = unknown>(path: string, body?: Record<string, unknown>): Promise<T>;
  put<T = unknown>(path: string, body?: Record<string, unknown>): Promise<T>;
  delete<T = unknown>(path: string): Promise<T>;
}

