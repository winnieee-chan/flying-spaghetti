/**
 * Backend Adapter
 * 
 * Transforms frontend data models to backend-compatible formats.
 */

import type { ExtractedKeywords, ScoringRatios, JobUpdate } from '../types/index.js';

// Frontend types
export interface FrontendJobInput {
  title?: string;
  description?: string;
  company?: string;
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

export interface FrontendJobUpdate {
  filters?: {
    experience?: string[];
    location?: string[];
    skills?: string[];
  };
  pipelineStages?: Array<{
    id: string;
    name: string;
    order: number;
    color?: string;
  }>;
  title?: string;
  description?: string;
  company?: string;
  message?: string;
}

/**
 * Convert frontend filters to backend extracted_keywords
 */
export const adaptFiltersToExtractedKeywords = (
  filters?: FrontendJobInput['filters'],
  existingKeywords?: ExtractedKeywords
): ExtractedKeywords => {
  // If no filters provided, return existing or defaults
  if (!filters) {
    return existingKeywords || {
      role: "Software Engineer",
      skills: [],
      min_experience_years: 0,
      location: "Remote",
    };
  }

  // Extract min experience from experience array
  let min_experience_years = 0;
  if (filters.experience && filters.experience.length > 0) {
    const expStr = filters.experience[0];
    const match = expStr.match(/(\d+)\+?\s*years?/i) || expStr.match(/(\d+)/);
    if (match) {
      min_experience_years = parseInt(match[1]);
    }
  }

  // Get location (first one if array)
  const location = filters.location && filters.location.length > 0 
    ? filters.location[0] 
    : (existingKeywords?.location || "Remote");

  // Get skills
  const skills = filters.skills || existingKeywords?.skills || [];

  // Get role from existing or default
  const role = existingKeywords?.role || "Software Engineer";

  return {
    role,
    skills,
    min_experience_years,
    location,
  };
};

/**
 * Convert frontend job input to backend job creation format
 */
export const adaptJobInputToBackend = (frontendJob: FrontendJobInput): {
  jd_text: string;
  job_title: string;
  company_name?: string;
  extracted_keywords?: ExtractedKeywords;
} => {
  return {
    jd_text: frontendJob.description || "",
    job_title: frontendJob.title || "Untitled Job",
    company_name: frontendJob.company,
    extracted_keywords: adaptFiltersToExtractedKeywords(frontendJob.filters),
  };
};

/**
 * Convert frontend job update to backend job update format
 */
export const adaptJobUpdateToBackend = (
  frontendUpdate: FrontendJobUpdate,
  existingJob?: { extracted_keywords?: ExtractedKeywords }
): JobUpdate => {
  const update: JobUpdate = {};

  // Convert filters to extracted_keywords
  if (frontendUpdate.filters) {
    update.extracted_keywords = adaptFiltersToExtractedKeywords(
      frontendUpdate.filters,
      existingJob?.extracted_keywords
    );
    update.status = 'FILTERS_SAVED';
  }

  // Store frontend-specific fields (we'll need to extend backend types)
  if (frontendUpdate.pipelineStages !== undefined) {
    update.pipelineStages = frontendUpdate.pipelineStages;
  }

  if (frontendUpdate.message !== undefined) {
    update.message = frontendUpdate.message;
  }

  if (frontendUpdate.title !== undefined) {
    update.title = frontendUpdate.title;
  }

  if (frontendUpdate.description !== undefined) {
    update.description = frontendUpdate.description;
  }

  if (frontendUpdate.company !== undefined) {
    update.company = frontendUpdate.company;
  }

  return update;
};
