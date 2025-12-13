export interface ExtractedKeywords {
  role: string;
  skills: string[];
  min_experience_years: number;
  location: string;
}

export interface ScoringRatios {
  startup_exp_weight: number;
  oss_activity_weight: number;
  tech_match_weight: number;
}

export interface Job {
  jobId: string;
  jd_text: string;
  job_title: string;
  company_name?: string;
  status: 'PROCESSING_KEYWORDS' | 'PROCESSED_KEYWORDS' | 'FILTERS_SAVED' | 'SOURCING_INITIATED' | 'PENDING_KEYWORDS';
  extracted_keywords: ExtractedKeywords;
  scoring_ratios: ScoringRatios;
  recruiterId: number;
  createdAt: string;
}

export interface Candidate {
  _id: string;
  full_name: string;
  headline: string;
  github_username: string;
  open_to_work: boolean;
  enrichment: {
    public_repos: number;
    total_stars: number;
    recent_activity_days: number;
    updated_at: string;
  };
  scores: Array<{
    job_id: string;
    score: number;
    breakdown_json: Array<{
      signal: string;
      value: number;
      reason: string;
    }>;
    outreach_messages?: string[];
  }>;
}

export interface CandidateScore {
  candidateId: string;
  full_name: string;
  headline: string;
  github_username: string;
  open_to_work: boolean;
  score: number;
  breakdown_json: Array<{
    signal: string;
    value: number;
    reason: string;
  }>;
  outreach_messages?: string[];
  enrichment: Candidate['enrichment'];
}

export interface JobUpdate {
  extracted_keywords?: ExtractedKeywords;
  scoring_ratios?: ScoringRatios;
  status?: Job['status'];
}

