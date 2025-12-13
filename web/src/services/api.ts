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
}

interface MockData {
  jobDescriptions: Map<string, JobDescription>;
  candidates: Map<string, Candidate>;
  nextJdId: number;
  nextCandidateId: number;
}

// Mock data store
const mockData: MockData = {
  jobDescriptions: new Map(),
  candidates: new Map(),
  nextJdId: 1,
  nextCandidateId: 1,
};

// Initialize with some sample data
const initializeMockData = (): void => {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  mockData.jobDescriptions.set("jd-1", {
    id: "jd-1",
    title: "Senior Frontend Engineer",
    description: "We are looking for an experienced frontend engineer to join our team. You will work on building beautiful, responsive user interfaces using modern JavaScript frameworks.",
    company: "Acme Corp",
    createdAt: twoDaysAgo.toISOString(),
    filters: {
      experience: ["3-5 years", "5+ years"],
      location: ["Remote", "San Francisco"],
      skills: ["React", "TypeScript", "Node.js"],
    },
    message: "Hello! We have an exciting opportunity that matches your profile...",
  });

  mockData.jobDescriptions.set("jd-2", {
    id: "jd-2",
    title: "Product Manager",
    description: "Join our team as a Product Manager and help shape the future of our products. You'll work closely with engineering and design teams.",
    company: "Globex",
    createdAt: fiveDaysAgo.toISOString(),
    filters: {
      experience: ["5+ years"],
      location: ["New York", "Remote"],
      skills: ["Product Strategy", "Agile", "Analytics"],
    },
    message: "Hi! We'd love to discuss a Product Manager role...",
  });

  mockData.jobDescriptions.set("jd-3", {
    id: "jd-3",
    title: "Full Stack Developer",
    description: "Seeking a talented full stack developer to build scalable web applications. Experience with both frontend and backend technologies required.",
    company: "TechStart Inc",
    createdAt: oneDayAgo.toISOString(),
    filters: {
      experience: ["2-3 years", "3-5 years"],
      location: ["Austin", "Remote"],
      skills: ["JavaScript", "Python", "PostgreSQL", "React"],
    },
    message: "Great opportunity for a full stack developer...",
  });

  mockData.jobDescriptions.set("jd-4", {
    id: "jd-4",
    title: "DevOps Engineer",
    description: "We need a DevOps engineer to manage our cloud infrastructure and CI/CD pipelines. AWS experience preferred.",
    company: "CloudScale Systems",
    createdAt: threeDaysAgo.toISOString(),
    filters: {
      experience: ["3-5 years", "5+ years"],
      location: ["Seattle", "Remote"],
      skills: ["AWS", "Docker", "Kubernetes", "Terraform"],
    },
    message: "Join our infrastructure team...",
  });

  mockData.jobDescriptions.set("jd-5", {
    id: "jd-5",
    title: "UI/UX Designer",
    description: "Looking for a creative UI/UX designer to create intuitive and beautiful user experiences. Must have a strong portfolio.",
    company: "DesignCo",
    createdAt: weekAgo.toISOString(),
    filters: {
      experience: ["2-3 years", "3-5 years"],
      location: ["Los Angeles", "Remote"],
      skills: ["Figma", "Sketch", "User Research", "Prototyping"],
    },
    message: "Exciting design opportunity...",
  });

  mockData.jobDescriptions.set("jd-6", {
    id: "jd-6",
    title: "Backend Engineer",
    description: "Senior backend engineer needed to build robust APIs and microservices. Experience with distributed systems is a plus.",
    company: "DataFlow Technologies",
    createdAt: twoWeeksAgo.toISOString(),
    filters: {
      experience: ["5+ years"],
      location: ["Boston", "Remote"],
      skills: ["Java", "Spring Boot", "Microservices", "Kafka"],
    },
    message: "We're building the next generation of APIs...",
  });

  mockData.jobDescriptions.set("jd-7", {
    id: "jd-7",
    title: "Mobile Developer",
    description: "Join our mobile team to build native iOS and Android applications. React Native experience is a plus.",
    company: "AppVenture",
    createdAt: threeDaysAgo.toISOString(),
    filters: {
      experience: ["2-3 years", "3-5 years"],
      location: ["Remote"],
      skills: ["React Native", "Swift", "Kotlin", "Mobile Development"],
    },
    message: "Build mobile apps that millions use...",
  });

  mockData.jobDescriptions.set("jd-8", {
    id: "jd-8",
    title: "Data Scientist",
    description: "Seeking a data scientist to analyze large datasets and build machine learning models. Python and SQL required.",
    company: "Analytics Pro",
    createdAt: threeWeeksAgo.toISOString(),
    filters: {
      experience: ["3-5 years", "5+ years"],
      location: ["Chicago", "Remote"],
      skills: ["Python", "Machine Learning", "SQL", "TensorFlow"],
    },
    message: "Help us make data-driven decisions...",
  });

  mockData.jobDescriptions.set("jd-9", {
    id: "jd-9",
    title: "Security Engineer",
    description: "We need a security engineer to protect our infrastructure and applications. Experience with penetration testing required.",
    company: "SecureNet",
    createdAt: monthAgo.toISOString(),
    filters: {
      experience: ["5+ years"],
      location: ["Washington DC", "Remote"],
      skills: ["Cybersecurity", "Penetration Testing", "OWASP", "Network Security"],
    },
    message: "Help keep our systems secure...",
  });

  mockData.jobDescriptions.set("jd-10", {
    id: "jd-10",
    title: "QA Automation Engineer",
    description: "Looking for a QA engineer to build automated test suites and ensure quality releases. Selenium experience preferred.",
    company: "QualityFirst",
    createdAt: oneDayAgo.toISOString(),
    filters: {
      experience: ["2-3 years", "3-5 years"],
      location: ["Remote"],
      skills: ["Selenium", "Test Automation", "Jest", "Cypress"],
    },
    message: "Ensure our products are bug-free...",
  });

  mockData.jobDescriptions.set("jd-11", {
    id: "jd-11",
    title: "Frontend Developer",
    description: "Entry to mid-level frontend developer position. Perfect for someone looking to grow their React skills.",
    company: "StartupHub",
    createdAt: weekAgo.toISOString(),
    filters: {
      experience: ["0-2 years", "2-3 years"],
      location: ["San Francisco", "Remote"],
      skills: ["React", "JavaScript", "CSS", "HTML"],
    },
    message: "Great opportunity to learn and grow...",
  });

  mockData.jobDescriptions.set("jd-12", {
    id: "jd-12",
    title: "Technical Lead",
    description: "Senior technical lead position. You'll mentor engineers and lead technical decisions. Strong leadership skills required.",
    company: "Enterprise Solutions",
    createdAt: twoDaysAgo.toISOString(),
    filters: {
      experience: ["5+ years"],
      location: ["New York", "Remote"],
      skills: ["Leadership", "Architecture", "System Design", "Team Management"],
    },
    message: "Lead our engineering team...",
  });

  // Sample candidates for jd-1 (2 candidates)
  mockData.candidates.set("jd-1/cd-1", {
    id: "cd-1",
    name: "John Doe",
    email: "john.doe@example.com",
    experience: "5+ years",
    location: "San Francisco",
    skills: ["React", "TypeScript", "Node.js", "GraphQL"],
    resume: "Experienced frontend engineer with 5+ years...",
    status: "pending",
  });

  mockData.candidates.set("jd-1/cd-2", {
    id: "cd-2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    experience: "3-5 years",
    location: "Remote",
    skills: ["React", "JavaScript", "CSS"],
    resume: "Frontend developer specializing in React...",
    status: "pending",
  });

  // Sample candidates for jd-2 (1 candidate)
  mockData.candidates.set("jd-2/cd-3", {
    id: "cd-3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    experience: "5+ years",
    location: "New York",
    skills: ["Product Strategy", "Agile", "Analytics", "Leadership"],
    resume: "Product Manager with extensive experience...",
    status: "pending",
  });

  // Add candidates to jd-3 (3 candidates)
  mockData.candidates.set("jd-3/cd-4", {
    id: "cd-4",
    name: "Alice Williams",
    email: "alice.williams@example.com",
    experience: "3-5 years",
    location: "Austin",
    skills: ["JavaScript", "Python", "React"],
    resume: "Full stack developer with 3+ years...",
    status: "pending",
  });

  mockData.candidates.set("jd-3/cd-5", {
    id: "cd-5",
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    experience: "2-3 years",
    location: "Remote",
    skills: ["JavaScript", "Node.js", "PostgreSQL"],
    resume: "Junior full stack developer...",
    status: "pending",
  });

  mockData.candidates.set("jd-3/cd-6", {
    id: "cd-6",
    name: "Diana Prince",
    email: "diana.prince@example.com",
    experience: "3-5 years",
    location: "Austin",
    skills: ["Python", "Django", "React", "PostgreSQL"],
    resume: "Experienced full stack developer...",
    status: "pending",
  });

  // Add candidates to jd-6 (4 candidates - highest count)
  mockData.candidates.set("jd-6/cd-7", {
    id: "cd-7",
    name: "Ethan Hunt",
    email: "ethan.hunt@example.com",
    experience: "5+ years",
    location: "Boston",
    skills: ["Java", "Spring Boot", "Microservices"],
    resume: "Senior backend engineer...",
    status: "pending",
  });

  mockData.candidates.set("jd-6/cd-8", {
    id: "cd-8",
    name: "Fiona Chen",
    email: "fiona.chen@example.com",
    experience: "5+ years",
    location: "Remote",
    skills: ["Java", "Distributed Systems", "Kafka"],
    resume: "Expert in distributed systems...",
    status: "pending",
  });

  mockData.candidates.set("jd-6/cd-9", {
    id: "cd-9",
    name: "George Miller",
    email: "george.miller@example.com",
    experience: "5+ years",
    location: "Boston",
    skills: ["Microservices", "Docker", "Kubernetes"],
    resume: "Backend engineer with microservices expertise...",
    status: "pending",
  });

  mockData.candidates.set("jd-6/cd-10", {
    id: "cd-10",
    name: "Helen Park",
    email: "helen.park@example.com",
    experience: "3-5 years",
    location: "Remote",
    skills: ["Java", "Spring Boot", "REST APIs"],
    resume: "Backend developer with API expertise...",
    status: "pending",
  });

  // Add candidate to jd-10 (1 candidate)
  mockData.candidates.set("jd-10/cd-11", {
    id: "cd-11",
    name: "Ian Thompson",
    email: "ian.thompson@example.com",
    experience: "2-3 years",
    location: "Remote",
    skills: ["Selenium", "Test Automation", "Jest"],
    resume: "QA engineer with automation experience...",
    status: "pending",
  });
};

// Initialize mock data on module load
initializeMockData();

interface ParsedEndpoint {
  type: "allJobs" | "jobDescription" | "candidates" | "candidate" | "unknown";
  jdId?: string;
  candidateId?: string;
  path?: string;
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
          });
        }
      }
      return candidates as T;
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

  throw new Error(`PUT endpoint not found: ${path}`);
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
};

