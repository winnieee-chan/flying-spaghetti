import type { Candidate, CandidateFilters } from "../types";

/**
 * Candidate Utilities
 *
 * Shared search algorithm and statistics functions for candidate data.
 * All candidate-related data transformations should go through these utilities.
 */

// Re-export CandidateFilters for backwards compatibility
export type { CandidateFilters } from "../types";

export interface DistributionEntry {
  label: string;
  count: number;
}

export interface CandidateStats {
  skills: DistributionEntry[];
  locations: DistributionEntry[];
  experiences: DistributionEntry[];
  topMatches: Candidate[];
}

// ============================================================================
// Filter Helpers
// ============================================================================

/**
 * Check if any filters are currently active
 */
export function hasActiveFilters(filters: CandidateFilters): boolean {
  return (
    (filters.keywords !== undefined && filters.keywords.length > 0) ||
    (filters.skills !== undefined && filters.skills.length > 0) ||
    (filters.experience !== undefined && filters.experience.length > 0) ||
    (filters.location !== undefined && filters.location.length > 0) ||
    filters.minMatchScore !== undefined
  );
}

// ============================================================================
// Search & Filter
// ============================================================================

/**
 * Search candidates by free-text query
 * Searches across name, headline, skills, location, email, and resume
 */
export function searchCandidates(
  candidates: Candidate[],
  query: string
): Candidate[] {
  if (!query.trim()) return candidates;
  
  const lowerQuery = query.toLowerCase();
  
  return candidates.filter((candidate) => {
    const searchableText = [
      candidate.name,
      candidate.headline || "",
      candidate.email,
      candidate.location,
      candidate.resume || "",
      ...candidate.skills,
    ]
      .join(" ")
      .toLowerCase();
    
    return searchableText.includes(lowerQuery);
  });
}

/**
 * Filter candidates based on structured filters
 */
export function filterCandidates(
  candidates: Candidate[],
  filters: CandidateFilters
): Candidate[] {
  return candidates.filter((candidate) => {
    // Keywords filter - any keyword must match somewhere
    if (filters.keywords && filters.keywords.length > 0) {
      const candidateText = [
        candidate.name,
        candidate.email,
        candidate.headline || "",
        candidate.resume || "",
        ...candidate.skills,
      ]
        .join(" ")
        .toLowerCase();

      const matchesAnyKeyword = filters.keywords.some((keyword) =>
        candidateText.includes(keyword.toLowerCase())
      );
      if (!matchesAnyKeyword) return false;
    }

    // Skills filter - any skill must match
    if (filters.skills && filters.skills.length > 0) {
      const matchesAnySkill = filters.skills.some((skill) =>
        candidate.skills.some((cSkill) =>
          cSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (!matchesAnySkill) return false;
    }

    // Experience filter - exact match on experience level
    if (filters.experience && filters.experience.length > 0) {
      if (!filters.experience.includes(candidate.experience)) {
        return false;
      }
    }

    // Location filter - partial match on location
    if (filters.location && filters.location.length > 0) {
      const matchesAnyLocation = filters.location.some((loc) =>
        candidate.location.toLowerCase().includes(loc.toLowerCase())
      );
      if (!matchesAnyLocation) return false;
    }

    // Match score filter
    if (filters.minMatchScore !== undefined) {
      if ((candidate.matchScore || 0) < filters.minMatchScore) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Combined search + filter in one pass
 */
export function searchAndFilterCandidates(
  candidates: Candidate[],
  query: string,
  filters: CandidateFilters
): Candidate[] {
  let result = candidates;
  
  if (query.trim()) {
    result = searchCandidates(result, query);
  }
  
  if (Object.keys(filters).length > 0) {
    result = filterCandidates(result, filters);
  }
  
  return result;
}

// ============================================================================
// Sorting
// ============================================================================

/**
 * Sort candidates by match score (highest first)
 */
export function sortByMatchScore(candidates: Candidate[]): Candidate[] {
  return [...candidates].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

/**
 * Get top N candidates by match score
 */
export function getTopMatches(candidates: Candidate[], limit = 5): Candidate[] {
  return sortByMatchScore(candidates).slice(0, limit);
}

// ============================================================================
// Statistics & Distributions
// ============================================================================

/**
 * Calculate skill distribution across candidates
 */
export function getSkillDistribution(
  candidates: Candidate[],
  limit?: number
): DistributionEntry[] {
  const skills: Record<string, number> = {};
  
  candidates.forEach((candidate) => {
    candidate.skills.forEach((skill) => {
      skills[skill] = (skills[skill] || 0) + 1;
    });
  });
  
  const sorted = Object.entries(skills)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
  
  return limit ? sorted.slice(0, limit) : sorted;
}

/**
 * Calculate location distribution across candidates
 */
export function getLocationDistribution(
  candidates: Candidate[],
  limit?: number
): DistributionEntry[] {
  const locations: Record<string, number> = {};
  
  candidates.forEach((candidate) => {
    locations[candidate.location] = (locations[candidate.location] || 0) + 1;
  });
  
  const sorted = Object.entries(locations)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
  
  return limit ? sorted.slice(0, limit) : sorted;
}

/**
 * Calculate experience distribution across candidates
 */
export function getExperienceDistribution(
  candidates: Candidate[],
  limit?: number
): DistributionEntry[] {
  const experiences: Record<string, number> = {};
  
  candidates.forEach((candidate) => {
    experiences[candidate.experience] = (experiences[candidate.experience] || 0) + 1;
  });
  
  const sorted = Object.entries(experiences)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
  
  return limit ? sorted.slice(0, limit) : sorted;
}

/**
 * Get all stats for a candidate pool in one call
 */
export function getCandidateStats(
  candidates: Candidate[],
  limits = { skills: 8, locations: 5, experiences: 5, topMatches: 5 }
): CandidateStats {
  return {
    skills: getSkillDistribution(candidates, limits.skills),
    locations: getLocationDistribution(candidates, limits.locations),
    experiences: getExperienceDistribution(candidates, limits.experiences),
    topMatches: getTopMatches(candidates, limits.topMatches),
  };
}

// ============================================================================
// Unique Value Extraction (for filter suggestions)
// ============================================================================

/**
 * Extract all unique skills from candidates
 */
export function getUniqueSkills(candidates: Candidate[]): string[] {
  return Array.from(new Set(candidates.flatMap((c) => c.skills))).sort();
}

/**
 * Extract all unique locations from candidates
 */
export function getUniqueLocations(candidates: Candidate[]): string[] {
  return Array.from(new Set(candidates.map((c) => c.location))).sort();
}

/**
 * Extract all unique experience levels from candidates
 */
export function getUniqueExperiences(candidates: Candidate[]): string[] {
  return Array.from(new Set(candidates.map((c) => c.experience))).sort();
}

/**
 * Get all unique values at once (for filter dropdowns)
 */
export function getAllUniqueValues(candidates: Candidate[]) {
  return {
    skills: getUniqueSkills(candidates),
    locations: getUniqueLocations(candidates),
    experiences: getUniqueExperiences(candidates),
  };
}

