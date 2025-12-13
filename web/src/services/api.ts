/**
 * API Abstraction Layer
 * 
 * This is the ONLY place that knows mocks exist.
 * All mock data and simulation logic is contained here.
 */

// Simulate network latency (in milliseconds)
const simulateLatency = (): Promise<void> => {
  const delay = Math.random() * 300 + 100; // 100-400ms
  return new Promise((resolve) => setTimeout(resolve, delay));
};

interface JobDescription {
  id: string;
  title: string;
  description?: string;
  company: string;
  createdAt: string;
  filters?: {
    experience?: string[];
    location?: string[];
    skills?: string[];
  };
  message?: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  experience: string;
  location: string;
  skills: string[];
  resume?: string;
  status: string;
  // New fields
  avatar?: string;
  headline?: string;
  source?: 'seeded' | 'external';
  matchScore?: number;
}

interface MockData {
  jobDescriptions: Map<string, JobDescription>;
  candidates: Map<string, Candidate>;
  starredCandidates: Map<string, Set<string>>; // jobId -> Set<candidateId>
  nextJdId: number;
  nextCandidateId: number;
}

// Mock data store
const mockData: MockData = {
  jobDescriptions: new Map(),
  candidates: new Map(),
  starredCandidates: new Map(),
  nextJdId: 1,
  nextCandidateId: 1,
};

// Initialize with some sample data
const initializeMockData = (): void => {
  const jdId1 = "jd-1";
  const jdId2 = "jd-2";
  
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  
  mockData.jobDescriptions.set(jdId1, {
    id: jdId1,
    title: "Senior Frontend Engineer",
    description: "We are looking for an experienced frontend engineer...",
    company: "Acme Corp",
    createdAt: twoDaysAgo.toISOString(),
    filters: {
      experience: ["3-5 years", "5+ years"],
      location: ["Remote", "San Francisco"],
      skills: ["React", "TypeScript", "Node.js"],
    },
    message: "Hello! We have an exciting opportunity that matches your profile...",
  });

  mockData.jobDescriptions.set(jdId2, {
    id: jdId2,
    title: "Product Manager",
    description: "Join our team as a Product Manager...",
    company: "Globex",
    createdAt: fiveDaysAgo.toISOString(),
    filters: {
      experience: ["5+ years"],
      location: ["New York", "Remote"],
      skills: ["Product Strategy", "Agile", "Analytics"],
    },
    message: "Hi! We'd love to discuss a Product Manager role...",
  });

  // Sample candidates for jd-1
  const candidate1: Candidate = {
    id: "cd-1",
    name: "John Doe",
    email: "john.doe@example.com",
    experience: "5+ years",
    location: "San Francisco",
    skills: ["React", "TypeScript", "Node.js", "GraphQL"],
    resume: "Experienced frontend engineer with 5+ years of experience building scalable web applications. Specialized in React and TypeScript with a strong background in modern frontend architecture.",
    status: "pending",
    headline: "Senior Frontend Engineer at Google",
    source: "seeded",
    matchScore: 95,
  };

  const candidate2: Candidate = {
    id: "cd-2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    experience: "3-5 years",
    location: "Remote",
    skills: ["React", "JavaScript", "CSS"],
    resume: "Frontend developer specializing in React and modern JavaScript. Passionate about creating beautiful user interfaces and improving user experience.",
    status: "pending",
    headline: "Frontend Developer at StartupCo",
    source: "seeded",
    matchScore: 75,
  };
  
  // Add more candidates for better visualization
  const candidate4: Candidate = {
    id: "cd-4",
    name: "Alice Williams",
    email: "alice.williams@example.com",
    experience: "3-5 years",
    location: "Remote",
    skills: ["React", "TypeScript", "Vue.js", "Testing"],
    resume: "Full-stack developer with focus on frontend. Experience with React, TypeScript, and Vue.js. Strong testing background.",
    status: "pending",
    headline: "Full-Stack Developer at DevShop",
    source: "seeded",
    matchScore: 82,
  };
  
  const candidate5: Candidate = {
    id: "cd-5",
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    experience: "5+ years",
    location: "San Francisco",
    skills: ["React", "TypeScript", "GraphQL", "AWS"],
    resume: "Senior engineer with expertise in React ecosystem and cloud infrastructure. Led multiple successful product launches.",
    status: "pending",
    headline: "Senior Software Engineer at CloudTech",
    source: "seeded",
    matchScore: 90,
  };
  
  const candidate6: Candidate = {
    id: "cd-6",
    name: "Diana Prince",
    email: "diana.prince@example.com",
    experience: "3-5 years",
    location: "Remote",
    skills: ["JavaScript", "React", "Node.js"],
    resume: "Passionate developer with experience in JavaScript and React. Always learning new technologies and best practices.",
    status: "pending",
    headline: "Software Engineer at CodeBase",
    source: "seeded",
    matchScore: 70,
  };

  mockData.candidates.set(`${jdId1}/cd-1`, candidate1);
  mockData.candidates.set(`${jdId1}/cd-2`, candidate2);
  mockData.candidates.set(`${jdId1}/cd-4`, candidate4);
  mockData.candidates.set(`${jdId1}/cd-5`, candidate5);
  mockData.candidates.set(`${jdId1}/cd-6`, candidate6);

  // Sample candidates for jd-2
  const candidate3: Candidate = {
    id: "cd-3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    experience: "5+ years",
    location: "New York",
    skills: ["Product Strategy", "Agile", "Analytics", "Leadership"],
    resume: "Product Manager with extensive experience leading cross-functional teams and delivering successful products. Strong background in analytics and agile methodologies.",
    status: "pending",
    headline: "Senior Product Manager at TechCorp",
    source: "seeded",
    matchScore: 88,
  };

  mockData.candidates.set(`${jdId2}/cd-3`, candidate3);
};

// Initialize mock data on module load
initializeMockData();

interface ParsedEndpoint {
  type: "allJobs" | "jobDescription" | "candidates" | "candidate" | "starred" | "externalSearch" | "unknown";
  jdId?: string;
  candidateId?: string;
  path?: string;
  query?: string;
}

/**
 * Parse REST-style endpoint and extract parameters
 */
const parseEndpoint = (path: string): ParsedEndpoint => {
  // Pattern: /jd (all jobs) or /jd-id or /jd-id/cd or /jd-id/cd-id
  if (path === "/jd") {
    return { type: "allJobs" };
  }
  
  const jdIdMatch = path.match(/^\/([^/]+)$/);
  const candidatesMatch = path.match(/^\/([^/]+)\/cd$/);
  const candidateMatch = path.match(/^\/([^/]+)\/cd\/([^/]+)$/);
  const starredMatch = path.match(/^\/([^/]+)\/starred$/);
  const starredCandidateMatch = path.match(/^\/([^/]+)\/starred\/([^/]+)$/);
  const externalSearchMatch = path.match(/^\/([^/]+)\/cd\/external-search$/);

  if (candidateMatch) {
    return { type: "candidate", jdId: candidateMatch[1], candidateId: candidateMatch[2] };
  }
  if (candidatesMatch) {
    return { type: "candidates", jdId: candidatesMatch[1] };
  }
  if (starredMatch) {
    return { type: "starred", jdId: starredMatch[1] };
  }
  if (starredCandidateMatch) {
    return { type: "starred", jdId: starredCandidateMatch[1], candidateId: starredCandidateMatch[2] };
  }
  if (externalSearchMatch) {
    return { type: "externalSearch", jdId: externalSearchMatch[1] };
  }
  if (jdIdMatch) {
    return { type: "jobDescription", jdId: jdIdMatch[1] };
  }
  return { type: "unknown", path };
};

/**
 * GET request handler
 */
const handleGet = async <T = unknown>(path: string): Promise<T> => {
  await simulateLatency();

  const parsed = parseEndpoint(path);

  switch (parsed.type) {
    case "allJobs": {
      // Return all jobs as an array
      const jobs = [];
      for (const jd of mockData.jobDescriptions.values()) {
        // Count candidates for this job
        let candidateCount = 0;
        for (const key of mockData.candidates.keys()) {
          if (key.startsWith(`${jd.id}/`)) {
            candidateCount++;
          }
        }
        
        jobs.push({
          id: jd.id,
          title: jd.title,
          description: jd.description,
          company: jd.company,
          createdAt: jd.createdAt,
          candidateCount,
          filters: jd.filters,
          message: jd.message,
        });
      }
      return jobs as T;
    }

    case "jobDescription": {
      if (!parsed.jdId) {
        throw new Error("Job ID is required");
      }
      const jd = mockData.jobDescriptions.get(parsed.jdId);
      if (!jd) {
        throw new Error(`Job description ${parsed.jdId} not found`);
      }
      return {
        id: jd.id,
        title: jd.title,
        description: jd.description,
        company: jd.company,
        filters: jd.filters,
        message: jd.message,
      } as T;
    }

    case "candidates": {
      if (!parsed.jdId) {
        throw new Error("Job ID is required");
      }
      const candidates = [];
      for (const [key, candidate] of mockData.candidates.entries()) {
        if (key.startsWith(`${parsed.jdId}/`)) {
          candidates.push({
            id: candidate.id,
            name: candidate.name,
            email: candidate.email,
            experience: candidate.experience,
            location: candidate.location,
            skills: candidate.skills,
            status: candidate.status,
            resume: candidate.resume,
            avatar: candidate.avatar,
            headline: candidate.headline,
            source: candidate.source,
            matchScore: candidate.matchScore,
          });
        }
      }
      return candidates as T;
    }
    
    case "starred": {
      if (!parsed.jdId) {
        throw new Error("Job ID is required");
      }
      const starredIds = mockData.starredCandidates.get(parsed.jdId) || new Set<string>();
      const starredCandidates = [];
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
        throw new Error(`Candidate ${parsed.candidateId} not found for job ${parsed.jdId}`);
      }
      return candidate as T;
    }

    default:
      throw new Error(`GET endpoint not found: ${path}`);
  }
};

/**
 * POST request handler
 */
const handlePost = async <T = unknown>(path: string, body: Record<string, unknown>): Promise<T> => {
  await simulateLatency();

  const parsed = parseEndpoint(path);

  // POST /jd - Create job description
  if (path === "/jd" || path.match(/^\/jd$/)) {
    const jdId = `jd-${mockData.nextJdId++}`;
    const newJd: JobDescription = {
      id: jdId,
      title: (body.title as string) || "Untitled Job",
      description: (body.description as string) || "",
      company: (body.company as string) || "",
      filters: (body.filters as JobDescription["filters"]) || {
        experience: [],
        location: [],
        skills: [],
      },
      message: (body.message as string) || "",
      createdAt: new Date().toISOString(),
    };
    mockData.jobDescriptions.set(jdId, newJd);
    return newJd as T;
  }

  // POST /:jdId/cd/external-search - Search external candidates
  if (parsed.type === "externalSearch" && parsed.jdId) {
    const query = (body.query as string) || "";
    const queryLower = query.toLowerCase();
    
    // Generate some mock external candidates
    const externalCandidates: Candidate[] = [];
    const names = ["Emma Davis", "Frank Miller", "Grace Lee", "Henry Wilson"];
    const companies = ["BigTech", "StartupXYZ", "EnterpriseInc", "InnovationLab"];
    
    names.forEach((name, index) => {
      const candidateId = `cd-ext-${mockData.nextCandidateId++}`;
      const candidate: Candidate = {
        id: candidateId,
        name: name,
        email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
        experience: index % 2 === 0 ? "5+ years" : "3-5 years",
        location: index % 2 === 0 ? "San Francisco" : "Remote",
        skills: ["React", "TypeScript", "Node.js", "GraphQL"],
        resume: `Experienced developer with strong background in modern web technologies.`,
        status: "pending",
        headline: `Senior Engineer at ${companies[index]}`,
        source: "external",
        matchScore: 85 - (index * 5), // Varying match scores
      };
      externalCandidates.push(candidate);
      mockData.candidates.set(`${parsed.jdId}/${candidateId}`, candidate);
    });
    
    // Filter by query if provided
    if (query) {
      return externalCandidates.filter(c => 
        c.name.toLowerCase().includes(queryLower) ||
        c.headline?.toLowerCase().includes(queryLower) ||
        c.skills.some(s => s.toLowerCase().includes(queryLower))
      ) as T;
    }
    
    return externalCandidates as T;
  }

  throw new Error(`POST endpoint not found: ${path}`);
};

/**
 * PUT request handler
 */
const handlePut = async <T = unknown>(path: string, body: Record<string, unknown>): Promise<T> => {
  await simulateLatency();

  const parsed = parseEndpoint(path);

  if (parsed.type === "jobDescription" && parsed.jdId) {
    const jd = mockData.jobDescriptions.get(parsed.jdId);
    if (!jd) {
      throw new Error(`Job description ${parsed.jdId} not found`);
    }

    // Update filters or other fields
    if (body.filters !== undefined) {
      jd.filters = body.filters as JobDescription["filters"];
    }
    if (body.title !== undefined) {
      jd.title = body.title as string;
    }
    if (body.description !== undefined) {
      jd.description = body.description as string;
    }
    if (body.company !== undefined) {
      jd.company = body.company as string;
    }
    if (body.message !== undefined) {
      jd.message = body.message as string;
    }

    mockData.jobDescriptions.set(parsed.jdId, jd);
    return jd as T;
  }

  // PUT /:jdId/starred/:cdId - Add candidate to star list
  if (parsed.type === "starred" && parsed.jdId && parsed.candidateId) {
    const starred = mockData.starredCandidates.get(parsed.jdId) || new Set<string>();
    starred.add(parsed.candidateId);
    mockData.starredCandidates.set(parsed.jdId, starred);
    return { success: true } as T;
  }

  throw new Error(`PUT endpoint not found: ${path}`);
};

/**
 * DELETE request handler
 */
const handleDelete = async <T = unknown>(path: string): Promise<T> => {
  await simulateLatency();

  const parsed = parseEndpoint(path);

  // DELETE /:jdId/starred/:cdId - Remove candidate from star list
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

/**
 * API abstraction object
 */
export const api = {
  /**
   * GET request
   * @param path - REST endpoint path (e.g., "/jd-1", "/jd-1/cd", "/jd-1/cd/cd-1")
   * @returns Response data
   */
  async get<T = unknown>(path: string): Promise<T> {
    try {
      return await handleGet<T>(path);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`API GET ${path}: ${errorMessage}`);
    }
  },

  /**
   * POST request
   * @param path - REST endpoint path (e.g., "/jd")
   * @param body - Request body
   * @returns Response data
   */
  async post<T = unknown>(path: string, body: Record<string, unknown> = {}): Promise<T> {
    try {
      return await handlePost<T>(path, body);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`API POST ${path}: ${errorMessage}`);
    }
  },

  /**
   * PUT request
   * @param path - REST endpoint path (e.g., "/jd-1")
   * @param body - Request body
   * @returns Response data
   */
  async put<T = unknown>(path: string, body: Record<string, unknown> = {}): Promise<T> {
    try {
      return await handlePut<T>(path, body);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`API PUT ${path}: ${errorMessage}`);
    }
  },

  /**
   * DELETE request
   * @param path - REST endpoint path (e.g., "/jd-1/starred/cd-1")
   * @returns Response data
   */
  async delete<T = unknown>(path: string): Promise<T> {
    try {
      return await handleDelete<T>(path);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`API DELETE ${path}: ${errorMessage}`);
    }
  },
};

