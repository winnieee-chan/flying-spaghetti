/**
 * Frontend Adapter
 * 
 * Transforms backend data models to frontend-compatible formats.
 */

import type { Job as BackendJob, CandidateScore, Candidate as BackendCandidate } from '../types/index.js';
import db from '../db/db.js';

// Frontend types (matching web/src/types/index.ts)
export interface FrontendJob {
  id: string;
  title: string;
  description?: string;
  company: string;
  createdAt: string;
  candidateCount?: number;
  filters?: {
    experience?: string[];
    location?: string[];
    skills?: string[];
  };
  message?: string;
  pipelineStages?: Array<{
    id: string;
    name: string;
    order: number;
    color?: string;
  }>;
}

export interface FrontendCandidate {
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
  aiRecommendation?: "reach_out" | "wait" | "archive" | "advance" | "offer" | "reject";
  conversationHistory?: Array<{
    id: string;
    from: "founder" | "candidate";
    content: string;
    timestamp: string;
    aiDrafted?: boolean;
  }>;
}

// Default pipeline stages
const DEFAULT_PIPELINE_STAGES = [
  { id: "new", name: "New", order: 0 },
  { id: "engaged", name: "Engaged", order: 1 },
  { id: "closing", name: "Closing", order: 2 },
];

/**
 * Convert backend Job to frontend Job format
 */
export const adaptJobToFrontend = (backendJob: BackendJob, candidateCount?: number): FrontendJob => {
  // Convert extracted_keywords to filters
  const filters = {
    experience: backendJob.extracted_keywords.min_experience_years 
      ? [`${backendJob.extracted_keywords.min_experience_years}+ years`]
      : [],
    location: backendJob.extracted_keywords.location ? [backendJob.extracted_keywords.location] : [],
    skills: backendJob.extracted_keywords.skills || [],
  };

  // Get pipeline stages from job data or use defaults
  const pipelineStages = backendJob.pipelineStages || DEFAULT_PIPELINE_STAGES;

  return {
    id: backendJob.jobId,
    title: backendJob.job_title,
    description: backendJob.jd_text,
    company: backendJob.company_name || "Unknown Company",
    createdAt: backendJob.createdAt,
    candidateCount: candidateCount,
    filters,
    pipelineStages,
    message: backendJob.message,
  };
};

/**
 * Convert backend CandidateScore to frontend Candidate format
 */
export const adaptCandidateToFrontend = (
  candidateScore: CandidateScore,
  backendCandidate?: BackendCandidate
): FrontendCandidate => {
  // Extract experience from keywords or breakdown
  let experience = "Unknown";
  if (backendCandidate?.keywords?.min_experience_years) {
    experience = `${backendCandidate.keywords.min_experience_years} years`;
  } else if (candidateScore.breakdown_json) {
    const expSignal = candidateScore.breakdown_json.find(s => 
      s.signal.toLowerCase().includes('experience') || 
      s.signal.toLowerCase().includes('years')
    );
    if (expSignal) {
      experience = `${expSignal.value} years`;
    }
  }

  // Extract location
  const location = backendCandidate?.keywords?.location || 
                   candidateScore.breakdown_json?.find(s => 
                     s.signal.toLowerCase().includes('location')
                   )?.reason || 
                   "Unknown";

  // Extract skills
  const skills = backendCandidate?.keywords?.skills || 
                 candidateScore.breakdown_json
                   ?.filter(s => s.signal.toLowerCase().includes('skill') || 
                                s.signal.toLowerCase().includes('tech'))
                   .map(s => s.reason) || 
                 [];

  // Get email from backend candidate
  const email = backendCandidate?.email || "";

  // Get headline
  const headline = candidateScore.headline || backendCandidate?.bio?.substring(0, 100) || "";

  // Get pipeline stage (stored separately, default to "new")
  const pipelineStage = candidateScore.pipelineStage || "new";

  // Get conversation history (stored separately)
  const conversationHistory = candidateScore.conversationHistory || [];

  // Get AI fields (stored separately)
  const aiFitScore = candidateScore.aiFitScore;
  const aiSummary = candidateScore.aiSummary;
  // Type guard for aiRecommendation to ensure it's a valid value
  const validRecommendations = ["reach_out", "wait", "archive", "advance", "offer", "reject"] as const;
  const aiRecommendation = candidateScore.aiRecommendation && 
    validRecommendations.includes(candidateScore.aiRecommendation as any)
    ? candidateScore.aiRecommendation as "reach_out" | "wait" | "archive" | "advance" | "offer" | "reject"
    : undefined;

  return {
    id: candidateScore.candidateId,
    name: candidateScore.full_name,
    email,
    experience,
    location,
    skills,
    headline,
    status: candidateScore.open_to_work ? "Open to work" : "Not actively looking",
    matchScore: candidateScore.score,
    pipelineStage: pipelineStage as "new" | "engaged" | "closing",
    aiFitScore,
    aiSummary,
    aiRecommendation,
    conversationHistory,
    source: "seeded", // Default, can be updated
  };
};

/**
 * Convert array of backend jobs to frontend format
 */
export const adaptJobsToFrontend = (backendJobs: BackendJob[]): FrontendJob[] => {
  return backendJobs.map(job => {
    // Count candidates for this job
    const candidates = db.getCandidatesByJobId(job.jobId);
    return adaptJobToFrontend(job, candidates.length);
  });
};

/**
 * Convert array of candidate scores to frontend format
 */
export const adaptCandidatesToFrontend = (
  candidateScores: CandidateScore[],
  backendCandidates: (BackendCandidate | undefined)[]
): FrontendCandidate[] => {
  // Create a map for quick lookup
  const candidateMap = new Map(
    backendCandidates
      .filter((c): c is BackendCandidate => c !== undefined)
      .map(c => [c._id, c])
  );

  return candidateScores.map(score => {
    const backendCandidate = candidateMap.get(score.candidateId);
    return adaptCandidateToFrontend(score, backendCandidate);
  });
};
