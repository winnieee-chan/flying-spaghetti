/**
 * Mock Data Store
 *
 * In-memory data store for mock API responses.
 */

import type { Job, Candidate } from "../../types";
import { generateCandidate } from "./generators";

// ============================================================================
// Types
// ============================================================================

export interface MockDataStore {
  jobDescriptions: Map<string, Job>;
  candidates: Map<string, Candidate>;
  starredCandidates: Map<string, Set<string>>;
  nextJdId: number;
  nextCandidateId: number;
}

// ============================================================================
// Store
// ============================================================================

export const mockData: MockDataStore = {
  jobDescriptions: new Map(),
  candidates: new Map(),
  starredCandidates: new Map(),
  nextJdId: 1,
  nextCandidateId: 1,
};

// ============================================================================
// Initialization
// ============================================================================

export const initializeMockData = (): void => {
  // Clear existing data
  mockData.jobDescriptions.clear();
  mockData.candidates.clear();
  mockData.starredCandidates.clear();

  const jdId1 = "jd-1";
  const jdId2 = "jd-2";

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  mockData.jobDescriptions.set(jdId1, {
    id: jdId1,
    title: "Senior Frontend Engineer",
    description:
      "We are looking for an experienced frontend engineer to join our team and build next-generation web applications.",
    company: "Acme Corp",
    createdAt: twoDaysAgo.toISOString(),
    filters: {
      experience: ["3-5 years", "5-7 years", "7-10 years"],
      location: ["Remote", "Sydney", "Melbourne"],
      skills: ["React", "TypeScript", "Node.js"],
    },
    message:
      "Hello! We have an exciting opportunity that matches your profile...",
  });

  mockData.jobDescriptions.set(jdId2, {
    id: jdId2,
    title: "Product Manager",
    description:
      "Join our team as a Product Manager leading cross-functional initiatives.",
    company: "Globex",
    createdAt: fiveDaysAgo.toISOString(),
    filters: {
      experience: ["5-7 years", "7-10 years", "10+ years"],
      location: ["Brisbane", "Remote"],
      skills: ["Agile", "System Design", "Data Structures"],
    },
    message: "Hi! We'd love to discuss a Product Manager role...",
  });

  // Generate 120 candidates for jd-1
  for (let i = 1; i <= 120; i++) {
    const candidate = generateCandidate(i);
    mockData.candidates.set(`${jdId1}/${candidate.id}`, candidate);
  }

  // Generate 50 candidates for jd-2
  for (let i = 121; i <= 170; i++) {
    const candidate = generateCandidate(i);
    mockData.candidates.set(`${jdId2}/${candidate.id}`, candidate);
  }

  mockData.nextCandidateId = 171;
  mockData.nextJdId = 3;
};

// Initialize on module load
initializeMockData();

// ============================================================================
// Helper Functions
// ============================================================================

export const getNextCandidateId = (): number => mockData.nextCandidateId++;
export const getNextJdId = (): number => mockData.nextJdId++;

export const getCandidatesForJob = (jdId: string): Candidate[] => {
  const candidates: Candidate[] = [];
  for (const [key, candidate] of mockData.candidates.entries()) {
    if (key.startsWith(`${jdId}/`)) {
      candidates.push(candidate);
    }
  }
  return candidates;
};

export const countCandidatesForJob = (jdId: string): number => {
  let count = 0;
  for (const key of mockData.candidates.keys()) {
    if (key.startsWith(`${jdId}/`)) {
      count++;
    }
  }
  return count;
};

