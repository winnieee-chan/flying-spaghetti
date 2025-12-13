/**
 * Mock Request Handlers
 *
 * Handles mock API requests with simulated latency and responses.
 */

import type { Job, Candidate, Message, PipelineStage } from "../../types";
import { MOCK_LATENCY_MIN, MOCK_LATENCY_MAX } from "../config";
import {
  mockData,
  getNextCandidateId,
  getCandidatesForJob,
  countCandidatesForJob,
} from "./mockData";
import { generateExternalCandidate, pickRandom } from "./generators";

// ============================================================================
// Latency Simulation
// ============================================================================

const simulateLatency = (): Promise<void> => {
  const delay =
    Math.random() * (MOCK_LATENCY_MAX - MOCK_LATENCY_MIN) + MOCK_LATENCY_MIN;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// ============================================================================
// Endpoint Parsing
// ============================================================================

interface ParsedEndpoint {
  type:
    | "allJobs"
    | "jobDescription"
    | "candidates"
    | "candidate"
    | "starred"
    | "externalSearch"
    | "batchMove"
    | "updateStage"
    | "sendMessage"
    | "aiAnalyze"
    | "aiDraftMessage"
    | "aiSummarize"
    | "aiSuggestMessage"
    | "aiSuggestTimes"
    | "aiDraftOffer"
    | "aiNegotiate"
    | "aiDecisionSummary"
    | "unknown";
  jdId?: string;
  candidateId?: string;
  path?: string;
}

const parseEndpoint = (path: string): ParsedEndpoint => {
  if (path === "/jd") {
    return { type: "allJobs" };
  }

  // AI endpoints
  const aiAnalyzeMatch = path.match(
    /^\/([^/]+)\/cd\/([^/]+)\/ai\/analyze$/
  );
  const aiDraftMessageMatch = path.match(
    /^\/([^/]+)\/cd\/([^/]+)\/ai\/draft-message$/
  );
  const aiSummarizeMatch = path.match(
    /^\/([^/]+)\/cd\/([^/]+)\/ai\/summarize-conversation$/
  );
  const aiSuggestMessageMatch = path.match(
    /^\/([^/]+)\/cd\/([^/]+)\/ai\/suggest-message$/
  );
  const aiSuggestTimesMatch = path.match(
    /^\/([^/]+)\/cd\/([^/]+)\/ai\/suggest-times$/
  );
  const aiDraftOfferMatch = path.match(
    /^\/([^/]+)\/cd\/([^/]+)\/ai\/draft-offer$/
  );
  const aiNegotiateMatch = path.match(
    /^\/([^/]+)\/cd\/([^/]+)\/ai\/negotiate$/
  );
  const aiDecisionSummaryMatch = path.match(
    /^\/([^/]+)\/cd\/([^/]+)\/ai\/decision-summary$/
  );

  if (aiAnalyzeMatch) {
    return { type: "aiAnalyze", jdId: aiAnalyzeMatch[1], candidateId: aiAnalyzeMatch[2] };
  }
  if (aiDraftMessageMatch) {
    return { type: "aiDraftMessage", jdId: aiDraftMessageMatch[1], candidateId: aiDraftMessageMatch[2] };
  }
  if (aiSummarizeMatch) {
    return { type: "aiSummarize", jdId: aiSummarizeMatch[1], candidateId: aiSummarizeMatch[2] };
  }
  if (aiSuggestMessageMatch) {
    return { type: "aiSuggestMessage", jdId: aiSuggestMessageMatch[1], candidateId: aiSuggestMessageMatch[2] };
  }
  if (aiSuggestTimesMatch) {
    return { type: "aiSuggestTimes", jdId: aiSuggestTimesMatch[1], candidateId: aiSuggestTimesMatch[2] };
  }
  if (aiDraftOfferMatch) {
    return { type: "aiDraftOffer", jdId: aiDraftOfferMatch[1], candidateId: aiDraftOfferMatch[2] };
  }
  if (aiNegotiateMatch) {
    return { type: "aiNegotiate", jdId: aiNegotiateMatch[1], candidateId: aiNegotiateMatch[2] };
  }
  if (aiDecisionSummaryMatch) {
    return { type: "aiDecisionSummary", jdId: aiDecisionSummaryMatch[1], candidateId: aiDecisionSummaryMatch[2] };
  }

  // Other endpoints
  const sendMessageMatch = path.match(/^\/([^/]+)\/cd\/([^/]+)\/messages$/);
  const updateStageMatch = path.match(/^\/([^/]+)\/cd\/([^/]+)\/stage$/);
  const externalSearchMatch = path.match(/^\/([^/]+)\/cd\/external-search$/);
  const batchMoveMatch = path.match(/^\/([^/]+)\/cd\/batch-move$/);
  const candidateMatch = path.match(/^\/([^/]+)\/cd\/([^/]+)$/);
  const candidatesMatch = path.match(/^\/([^/]+)\/cd$/);
  const starredCandidateMatch = path.match(/^\/([^/]+)\/starred\/([^/]+)$/);
  const starredMatch = path.match(/^\/([^/]+)\/starred$/);
  const jdIdMatch = path.match(/^\/([^/]+)$/);

  if (sendMessageMatch) {
    return { type: "sendMessage", jdId: sendMessageMatch[1], candidateId: sendMessageMatch[2] };
  }
  if (updateStageMatch) {
    return { type: "updateStage", jdId: updateStageMatch[1], candidateId: updateStageMatch[2] };
  }
  if (externalSearchMatch) {
    return { type: "externalSearch", jdId: externalSearchMatch[1] };
  }
  if (batchMoveMatch) {
    return { type: "batchMove", jdId: batchMoveMatch[1] };
  }
  if (candidateMatch) {
    return { type: "candidate", jdId: candidateMatch[1], candidateId: candidateMatch[2] };
  }
  if (candidatesMatch) {
    return { type: "candidates", jdId: candidatesMatch[1] };
  }
  if (starredCandidateMatch) {
    return { type: "starred", jdId: starredCandidateMatch[1], candidateId: starredCandidateMatch[2] };
  }
  if (starredMatch) {
    return { type: "starred", jdId: starredMatch[1] };
  }
  if (jdIdMatch) {
    return { type: "jobDescription", jdId: jdIdMatch[1] };
  }

  return { type: "unknown", path };
};

// ============================================================================
// GET Handler
// ============================================================================

export const handleGet = async <T = unknown>(path: string): Promise<T> => {
  await simulateLatency();
  const parsed = parseEndpoint(path);

  switch (parsed.type) {
    case "allJobs": {
      const jobs: Job[] = [];
      for (const jd of mockData.jobDescriptions.values()) {
        jobs.push({
          ...jd,
          candidateCount: countCandidatesForJob(jd.id),
        });
      }
      return jobs as T;
    }

    case "jobDescription": {
      if (!parsed.jdId) throw new Error("Job ID is required");
      const jd = mockData.jobDescriptions.get(parsed.jdId);
      if (!jd) throw new Error(`Job description ${parsed.jdId} not found`);
      return jd as T;
    }

    case "candidates": {
      if (!parsed.jdId) throw new Error("Job ID is required");
      return getCandidatesForJob(parsed.jdId) as T;
    }

    case "starred": {
      if (!parsed.jdId) throw new Error("Job ID is required");
      const starredIds = mockData.starredCandidates.get(parsed.jdId) || new Set<string>();
      const starredCandidates: Candidate[] = [];
      for (const candidateId of starredIds) {
        const key = `${parsed.jdId}/${candidateId}`;
        const candidate = mockData.candidates.get(key);
        if (candidate) {
          starredCandidates.push(candidate);
        }
      }
      return starredCandidates as T;
    }

    case "candidate": {
      if (!parsed.jdId || !parsed.candidateId) {
        throw new Error("Job ID and Candidate ID are required");
      }
      const key = `${parsed.jdId}/${parsed.candidateId}`;
      const candidate = mockData.candidates.get(key);
      if (!candidate) {
        throw new Error(`Candidate ${parsed.candidateId} not found`);
      }
      return candidate as T;
    }

    default:
      throw new Error(`GET endpoint not found: ${path}`);
  }
};

// ============================================================================
// POST Handler
// ============================================================================

export const handlePost = async <T = unknown>(
  path: string,
  body: Record<string, unknown>
): Promise<T> => {
  await simulateLatency();
  const parsed = parseEndpoint(path);

  // POST /jd - Create job
  if (path === "/jd") {
    const jdId = crypto.randomUUID();
    const newJd: Job = {
      id: jdId,
      title: (body.title as string) || "Untitled Job",
      description: (body.description as string) || "",
      company: (body.company as string) || "",
      filters: (body.filters as Job["filters"]) || {
        experience: [],
        location: [],
        skills: [],
      },
      message: (body.message as string) || "",
      pipelineStages: body.pipelineStages as PipelineStage[] | undefined,
      createdAt: new Date().toISOString(),
    };
    mockData.jobDescriptions.set(jdId, newJd);
    return newJd as T;
  }

  // External search
  if (parsed.type === "externalSearch" && parsed.jdId) {
    const query = ((body.query as string) || "").toLowerCase();
    const externalCandidates: Candidate[] = [];

    for (let i = 0; i < 4; i++) {
      const candidate = generateExternalCandidate(getNextCandidateId());
      externalCandidates.push(candidate);
      mockData.candidates.set(`${parsed.jdId}/${candidate.id}`, candidate);
    }

    if (query) {
      return externalCandidates.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.headline?.toLowerCase().includes(query) ||
          c.skills.some((s) => s.toLowerCase().includes(query))
      ) as T;
    }
    return externalCandidates as T;
  }

  // Batch move
  if (parsed.type === "batchMove" && parsed.jdId) {
    const criteria = body.criteria as { minMatchScore?: number; maxMatchScore?: number };
    const targetStageId = body.targetStageId as string;
    let movedCount = 0;

    for (const [key, candidate] of mockData.candidates.entries()) {
      if (key.startsWith(`${parsed.jdId}/`)) {
        const matchScore = candidate.matchScore || 0;
        let shouldMove = false;

        if (criteria.minMatchScore !== undefined && criteria.maxMatchScore !== undefined) {
          shouldMove = matchScore >= criteria.minMatchScore && matchScore <= criteria.maxMatchScore;
        } else if (criteria.minMatchScore !== undefined) {
          shouldMove = matchScore >= criteria.minMatchScore;
        } else if (criteria.maxMatchScore !== undefined) {
          shouldMove = matchScore <= criteria.maxMatchScore;
        }

        if (shouldMove) {
          candidate.pipelineStage = targetStageId as Candidate["pipelineStage"];
          movedCount++;
        }
      }
    }
    return { count: movedCount } as T;
  }

  // Send message
  if (parsed.type === "sendMessage" && parsed.jdId && parsed.candidateId) {
    const key = `${parsed.jdId}/${parsed.candidateId}`;
    const candidate = mockData.candidates.get(key);
    if (!candidate) throw new Error("Candidate not found");

    const content = (body.content as string) || "";
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      from: "founder",
      content,
      timestamp: new Date().toISOString(),
      aiDrafted: true,
    };

    if (!candidate.conversationHistory) {
      candidate.conversationHistory = [];
    }
    candidate.conversationHistory.push(newMessage);

    // Simulate reply
    setTimeout(() => {
      const replies = [
        "Thank you for reaching out! I'm very interested.",
        "Thanks! I'd love to discuss this further.",
        "I appreciate you contacting me. Could you share more details?",
        "Great to hear from you! This sounds promising.",
      ];
      candidate.conversationHistory?.push({
        id: `msg-${Date.now() + 1}`,
        from: "candidate",
        content: pickRandom(replies),
        timestamp: new Date().toISOString(),
      });
    }, 2000);

    return { success: true, messageId: newMessage.id } as T;
  }

  // AI endpoints
  if (parsed.type === "aiAnalyze" && parsed.jdId && parsed.candidateId) {
    const key = `${parsed.jdId}/${parsed.candidateId}`;
    const candidate = mockData.candidates.get(key);
    const job = mockData.jobDescriptions.get(parsed.jdId);
    if (!candidate || !job) throw new Error("Candidate or job not found");

    const matchScore = candidate.matchScore || 70;
    const fitScore = Math.min(100, matchScore + Math.floor(Math.random() * 10) - 5);
    const recommendation = fitScore >= 80 ? "reach_out" : fitScore >= 60 ? "wait" : "archive";
    const confidence = Math.min(100, fitScore + 10);
    const strengths = candidate.skills.slice(0, 3).join(", ");
    const summary = `Strong candidate with ${candidate.experience} of experience. Key strengths: ${strengths}. ${
      fitScore >= 80 ? "Highly recommended." : fitScore >= 60 ? "Worth considering." : "May not be the best fit."
    }`;

    candidate.aiFitScore = fitScore;
    candidate.aiSummary = summary;
    candidate.aiRecommendation = recommendation as Candidate["aiRecommendation"];

    return { fitScore, summary, recommendation, confidence } as T;
  }

  if (parsed.type === "aiDraftMessage" && parsed.jdId && parsed.candidateId) {
    const key = `${parsed.jdId}/${parsed.candidateId}`;
    const candidate = mockData.candidates.get(key);
    const job = mockData.jobDescriptions.get(parsed.jdId);
    if (!candidate || !job) throw new Error("Candidate or job not found");

    const firstName = candidate.name.split(" ")[0];
    const topSkills = candidate.skills.slice(0, 2).join(" and ");
    return `Hi ${firstName},\n\nI noticed your background in ${topSkills} and thought you might be interested in our ${job.title} role at ${job.company}.\n\nWould you be open to a brief conversation?\n\nBest regards` as T;
  }

  if (parsed.type === "aiSummarize") {
    return "Candidate has shown strong interest. Next step: schedule technical interview." as T;
  }

  if (parsed.type === "aiSuggestMessage") {
    const lastMessage = ((body.lastMessage as string) || "").toLowerCase();
    if (lastMessage.includes("interested") || lastMessage.includes("yes")) {
      return "Great! Let's schedule a time to chat. Are you available this week?" as T;
    }
    return "Thank you for your interest. Would you like to learn more about the role?" as T;
  }

  if (parsed.type === "aiSuggestTimes") {
    const times: Date[] = [];
    const now = new Date();
    for (let i = 1; i <= 3; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      date.setHours(14, 0, 0, 0);
      times.push(date);
      const date2 = new Date(date);
      date2.setHours(15, 30, 0, 0);
      times.push(date2);
    }
    return times as T;
  }

  if (parsed.type === "aiDraftOffer" && parsed.jdId && parsed.candidateId) {
    const key = `${parsed.jdId}/${parsed.candidateId}`;
    const candidate = mockData.candidates.get(key);
    const job = mockData.jobDescriptions.get(parsed.jdId);
    if (!candidate || !job) throw new Error("Candidate or job not found");

    const terms = (body.terms as Record<string, unknown>) || {};
    const salary = (terms.salary as string) || "$120,000 - $150,000";
    return `Dear ${candidate.name},\n\nWe are excited to extend an offer for the ${job.title} position.\n\nSalary: ${salary}\n\nWe look forward to having you on board.\n\nBest regards` as T;
  }

  if (parsed.type === "aiNegotiate") {
    const request = ((body.request as string) || "").toLowerCase();
    if (request.includes("salary")) {
      return "We have some flexibility within our range. What are your expectations?" as T;
    }
    if (request.includes("remote")) {
      return "We're open to discussing remote work arrangements." as T;
    }
    return "Let's discuss how we can make this work for both of us." as T;
  }

  if (parsed.type === "aiDecisionSummary" && parsed.candidateId) {
    const key = `${parsed.jdId}/${parsed.candidateId}`;
    const candidate = mockData.candidates.get(key);
    if (!candidate) throw new Error("Candidate not found");

    const decision = (body.decision as "hire" | "reject") || "reject";
    if (decision === "hire") {
      return `Decision: HIRE\n\n${candidate.name} demonstrated strong technical skills. Recommendation: Extend offer.` as T;
    }
    return `Decision: REJECT\n\nWhile ${candidate.name} has relevant experience, there were concerns about fit.` as T;
  }

  throw new Error(`POST endpoint not found: ${path}`);
};

// ============================================================================
// PUT Handler
// ============================================================================

export const handlePut = async <T = unknown>(
  path: string,
  body: Record<string, unknown>
): Promise<T> => {
  await simulateLatency();
  const parsed = parseEndpoint(path);

  if (parsed.type === "jobDescription" && parsed.jdId) {
    const jd = mockData.jobDescriptions.get(parsed.jdId);
    if (!jd) throw new Error(`Job ${parsed.jdId} not found`);

    if (body.filters !== undefined) jd.filters = body.filters as Job["filters"];
    if (body.title !== undefined) jd.title = body.title as string;
    if (body.description !== undefined) jd.description = body.description as string;
    if (body.company !== undefined) jd.company = body.company as string;
    if (body.message !== undefined) jd.message = body.message as string;
    if (body.pipelineStages !== undefined) {
      jd.pipelineStages = body.pipelineStages as PipelineStage[];
    }

    return jd as T;
  }

  if (parsed.type === "updateStage" && parsed.jdId && parsed.candidateId) {
    const key = `${parsed.jdId}/${parsed.candidateId}`;
    const candidate = mockData.candidates.get(key);
    if (!candidate) throw new Error(`Candidate ${parsed.candidateId} not found`);

    candidate.pipelineStage = body.stageId as Candidate["pipelineStage"];
    return { success: true } as T;
  }

  if (parsed.type === "starred" && parsed.jdId && parsed.candidateId) {
    const starred = mockData.starredCandidates.get(parsed.jdId) || new Set<string>();
    starred.add(parsed.candidateId);
    mockData.starredCandidates.set(parsed.jdId, starred);
    return { success: true } as T;
  }

  throw new Error(`PUT endpoint not found: ${path}`);
};

// ============================================================================
// DELETE Handler
// ============================================================================

export const handleDelete = async <T = unknown>(path: string): Promise<T> => {
  await simulateLatency();
  const parsed = parseEndpoint(path);

  if (parsed.type === "starred" && parsed.jdId && parsed.candidateId) {
    const starred = mockData.starredCandidates.get(parsed.jdId) || new Set<string>();
    starred.delete(parsed.candidateId);
    if (starred.size === 0) {
      mockData.starredCandidates.delete(parsed.jdId);
    } else {
      mockData.starredCandidates.set(parsed.jdId, starred);
    }
    return { success: true } as T;
  }

  throw new Error(`DELETE endpoint not found: ${path}`);
};

