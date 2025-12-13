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

// Data pools for generating candidates
const FIRST_NAMES = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Lisa", "Daniel", "Nancy",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
  "Kevin", "Dorothy", "Brian", "Carol", "George", "Amanda", "Timothy", "Melissa",
  "Ronald", "Deborah", "Edward", "Stephanie", "Jason", "Rebecca", "Jeffrey", "Sharon",
  "Ryan", "Laura", "Jacob", "Cynthia", "Gary", "Kathleen", "Nicholas", "Amy",
  "Eric", "Angela", "Jonathan", "Shirley", "Stephen", "Anna", "Larry", "Brenda",
  "Justin", "Pamela", "Scott", "Emma", "Brandon", "Nicole", "Benjamin", "Helen",
  "Samuel", "Samantha", "Raymond", "Katherine", "Gregory", "Christine", "Frank", "Debra",
  "Alexander", "Rachel", "Patrick", "Carolyn", "Jack", "Janet", "Dennis", "Catherine"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
  "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Chen", "Wu", "Kim", "Park", "Patel", "Shah",
  "Kumar", "Singh", "Cohen", "Sharma", "Nakamura", "Yamamoto", "Muller", "Schmidt"
];

const LOCATIONS = [
  "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide",
  "Canberra", "Gold Coast", "Newcastle", "Hobart", "Remote",
  "Darwin", "Wollongong", "Geelong", "Cairns", "Townsville"
];

const EXPERIENCE_LEVELS = ["0-2 years", "2-3 years", "3-5 years", "5-7 years", "7-10 years", "10+ years"];

const SKILLS_POOL = [
  // Frontend
  "React", "TypeScript", "JavaScript", "Vue.js", "Angular", "Svelte", "Next.js",
  "CSS", "Tailwind", "SCSS", "HTML5", "Redux", "GraphQL", "REST APIs",
  // Backend
  "Node.js", "Python", "Go", "Java", "Rust", "Ruby", "C++",
  "PostgreSQL", "MongoDB", "Redis", "MySQL", "DynamoDB",
  // DevOps & Cloud
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "CI/CD",
  // General
  "Git", "Agile", "System Design", "Testing", "Performance", "Security",
  "Machine Learning", "Data Structures", "Algorithms"
];

const COMPANIES = [
  "Google", "Meta", "Amazon", "Apple", "Microsoft", "Netflix", "Uber", "Airbnb",
  "Stripe", "Shopify", "Databricks", "Snowflake", "Figma", "Notion", "Slack",
  "LinkedIn", "Twitter", "Pinterest", "Snap", "Dropbox", "Spotify", "Square",
  "Coinbase", "Robinhood", "Plaid", "Rippling", "Brex", "Ramp", "Scale AI",
  "OpenAI", "Anthropic", "DeepMind", "Hugging Face", "Cohere", "Midjourney"
];

const TITLES = [
  "Software Engineer", "Senior Software Engineer", "Staff Engineer", 
  "Frontend Engineer", "Senior Frontend Engineer", "Backend Engineer",
  "Full Stack Engineer", "Platform Engineer", "Infrastructure Engineer",
  "Engineering Manager", "Tech Lead", "Principal Engineer"
];

// Helper to pick random items
const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickRandomN = <T>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

// Generate a candidate
const generateCandidate = (id: number): Candidate => {
  const firstName = pickRandom(FIRST_NAMES);
  const lastName = pickRandom(LAST_NAMES);
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
  const experience = pickRandom(EXPERIENCE_LEVELS);
  const location = pickRandom(LOCATIONS);
  const numSkills = 3 + Math.floor(Math.random() * 5); // 3-7 skills
  const skills = pickRandomN(SKILLS_POOL, numSkills);
  const company = pickRandom(COMPANIES);
  const title = pickRandom(TITLES);
  const matchScore = 50 + Math.floor(Math.random() * 50); // 50-100
  
  return {
    id: `cd-${id}`,
    name,
    email,
    experience,
    location,
    skills,
    resume: `${title} with ${experience} of experience. Skilled in ${skills.slice(0, 3).join(", ")}. Currently at ${company}.`,
    status: "pending",
    headline: `${title} at ${company}`,
    source: "seeded",
    matchScore,
  };
};

// Initialize with sample data
const initializeMockData = (): void => {
  const jdId1 = "jd-1";
  const jdId2 = "jd-2";
  
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  
  mockData.jobDescriptions.set(jdId1, {
    id: jdId1,
    title: "Senior Frontend Engineer",
    description: "We are looking for an experienced frontend engineer to join our team and build next-generation web applications.",
    company: "Acme Corp",
    createdAt: twoDaysAgo.toISOString(),
    filters: {
      experience: ["3-5 years", "5-7 years", "7-10 years"],
      location: ["Remote", "Sydney", "Melbourne"],
      skills: ["React", "TypeScript", "Node.js"],
    },
    message: "Hello! We have an exciting opportunity that matches your profile...",
  });

  mockData.jobDescriptions.set(jdId2, {
    id: jdId2,
    title: "Product Manager",
    description: "Join our team as a Product Manager leading cross-functional initiatives.",
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

