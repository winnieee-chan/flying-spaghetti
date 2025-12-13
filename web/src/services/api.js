/**
 * API Abstraction Layer
 * 
 * This is the ONLY place that knows mocks exist.
 * All mock data and simulation logic is contained here.
 */

// Simulate network latency (in milliseconds)
const simulateLatency = () => {
  const delay = Math.random() * 300 + 100; // 100-400ms
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// Mock data store
const mockData = {
  jobDescriptions: new Map(),
  candidates: new Map(),
  nextJdId: 1,
  nextCandidateId: 1,
};

// Initialize with some sample data
const initializeMockData = () => {
  const jdId1 = "jd-1";
  const jdId2 = "jd-2";
  
  mockData.jobDescriptions.set(jdId1, {
    id: jdId1,
    title: "Senior Frontend Engineer",
    description: "We are looking for an experienced frontend engineer...",
    company: "Acme Corp",
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
    filters: {
      experience: ["5+ years"],
      location: ["New York", "Remote"],
      skills: ["Product Strategy", "Agile", "Analytics"],
    },
    message: "Hi! We'd love to discuss a Product Manager role...",
  });

  // Sample candidates for jd-1
  const candidate1 = {
    id: "cd-1",
    name: "John Doe",
    email: "john.doe@example.com",
    experience: "5+ years",
    location: "San Francisco",
    skills: ["React", "TypeScript", "Node.js", "GraphQL"],
    resume: "Experienced frontend engineer with 5+ years...",
    status: "pending",
  };

  const candidate2 = {
    id: "cd-2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    experience: "3-5 years",
    location: "Remote",
    skills: ["React", "JavaScript", "CSS"],
    resume: "Frontend developer specializing in React...",
    status: "pending",
  };

  mockData.candidates.set(`${jdId1}/cd-1`, candidate1);
  mockData.candidates.set(`${jdId1}/cd-2`, candidate2);

  // Sample candidates for jd-2
  const candidate3 = {
    id: "cd-3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    experience: "5+ years",
    location: "New York",
    skills: ["Product Strategy", "Agile", "Analytics", "Leadership"],
    resume: "Product Manager with extensive experience...",
    status: "pending",
  };

  mockData.candidates.set(`${jdId2}/cd-3`, candidate3);
};

// Initialize mock data on module load
initializeMockData();

/**
 * Parse REST-style endpoint and extract parameters
 */
const parseEndpoint = (path) => {
  // Pattern: /jd-id or /jd-id/cd or /jd-id/cd-id
  const jdIdMatch = path.match(/^\/([^/]+)$/);
  const candidatesMatch = path.match(/^\/([^/]+)\/cd$/);
  const candidateMatch = path.match(/^\/([^/]+)\/cd\/([^/]+)$/);

  if (candidateMatch) {
    return { type: "candidate", jdId: candidateMatch[1], candidateId: candidateMatch[2] };
  }
  if (candidatesMatch) {
    return { type: "candidates", jdId: candidatesMatch[1] };
  }
  if (jdIdMatch) {
    return { type: "jobDescription", jdId: jdIdMatch[1] };
  }
  return { type: "unknown", path };
};

/**
 * GET request handler
 */
const handleGet = async (path) => {
  await simulateLatency();

  const parsed = parseEndpoint(path);

  switch (parsed.type) {
    case "jobDescription": {
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
      };
    }

    case "candidates": {
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
          });
        }
      }
      return candidates;
    }

    case "candidate": {
      const key = `${parsed.jdId}/${parsed.candidateId}`;
      const candidate = mockData.candidates.get(key);
      if (!candidate) {
        throw new Error(`Candidate ${parsed.candidateId} not found for job ${parsed.jdId}`);
      }
      return candidate;
    }

    default:
      throw new Error(`GET endpoint not found: ${path}`);
  }
};

/**
 * POST request handler
 */
const handlePost = async (path, body) => {
  await simulateLatency();

  // POST /jd - Create job description
  if (path === "/jd" || path.match(/^\/jd$/)) {
    const jdId = `jd-${mockData.nextJdId++}`;
    const newJd = {
      id: jdId,
      title: body.title || "Untitled Job",
      description: body.description || "",
      company: body.company || "",
      filters: body.filters || {
        experience: [],
        location: [],
        skills: [],
      },
      message: body.message || "",
    };
    mockData.jobDescriptions.set(jdId, newJd);
    return { id: jdId, ...newJd };
  }

  throw new Error(`POST endpoint not found: ${path}`);
};

/**
 * PUT request handler
 */
const handlePut = async (path, body) => {
  await simulateLatency();

  const parsed = parseEndpoint(path);

  if (parsed.type === "jobDescription") {
    const jd = mockData.jobDescriptions.get(parsed.jdId);
    if (!jd) {
      throw new Error(`Job description ${parsed.jdId} not found`);
    }

    // Update filters or other fields
    if (body.filters !== undefined) {
      jd.filters = body.filters;
    }
    if (body.title !== undefined) {
      jd.title = body.title;
    }
    if (body.description !== undefined) {
      jd.description = body.description;
    }
    if (body.company !== undefined) {
      jd.company = body.company;
    }
    if (body.message !== undefined) {
      jd.message = body.message;
    }

    mockData.jobDescriptions.set(parsed.jdId, jd);
    return jd;
  }

  throw new Error(`PUT endpoint not found: ${path}`);
};

/**
 * API abstraction object
 */
export const api = {
  /**
   * GET request
   * @param {string} path - REST endpoint path (e.g., "/jd-1", "/jd-1/cd", "/jd-1/cd/cd-1")
   * @returns {Promise<any>} Response data
   */
  async get(path) {
    try {
      return await handleGet(path);
    } catch (error) {
      throw new Error(`API GET ${path}: ${error.message}`);
    }
  },

  /**
   * POST request
   * @param {string} path - REST endpoint path (e.g., "/jd")
   * @param {object} body - Request body
   * @returns {Promise<any>} Response data
   */
  async post(path, body = {}) {
    try {
      return await handlePost(path, body);
    } catch (error) {
      throw new Error(`API POST ${path}: ${error.message}`);
    }
  },

  /**
   * PUT request
   * @param {string} path - REST endpoint path (e.g., "/jd-1")
   * @param {object} body - Request body
   * @returns {Promise<any>} Response data
   */
  async put(path, body = {}) {
    try {
      return await handlePut(path, body);
    } catch (error) {
      throw new Error(`API PUT ${path}: ${error.message}`);
    }
  },
};

