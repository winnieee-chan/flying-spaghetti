/**
 * Mock Data Generators
 *
 * Functions for generating realistic mock candidate data.
 */

import type { Candidate } from "../../types";

// ============================================================================
// Data Pools
// ============================================================================

export const FIRST_NAMES = [
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
  "Alexander", "Rachel", "Patrick", "Carolyn", "Jack", "Janet", "Dennis", "Catherine",
];

export const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
  "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Chen", "Wu", "Kim", "Park", "Patel", "Shah",
  "Kumar", "Singh", "Cohen", "Sharma", "Nakamura", "Yamamoto", "Muller", "Schmidt",
];

export const LOCATIONS = [
  "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide",
  "Canberra", "Gold Coast", "Newcastle", "Hobart", "Remote",
  "Darwin", "Wollongong", "Geelong", "Cairns", "Townsville",
];

export const EXPERIENCE_LEVELS = [
  "0-2 years", "2-3 years", "3-5 years", "5-7 years", "7-10 years", "10+ years",
];

export const SKILLS_POOL = [
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
  "Machine Learning", "Data Structures", "Algorithms",
];

export const COMPANIES = [
  "Google", "Meta", "Amazon", "Apple", "Microsoft", "Netflix", "Uber", "Airbnb",
  "Stripe", "Shopify", "Databricks", "Snowflake", "Figma", "Notion", "Slack",
  "LinkedIn", "Twitter", "Pinterest", "Snap", "Dropbox", "Spotify", "Square",
  "Coinbase", "Robinhood", "Plaid", "Rippling", "Brex", "Ramp", "Scale AI",
  "OpenAI", "Anthropic", "DeepMind", "Hugging Face", "Cohere", "Midjourney",
];

export const TITLES = [
  "Software Engineer", "Senior Software Engineer", "Staff Engineer",
  "Frontend Engineer", "Senior Frontend Engineer", "Backend Engineer",
  "Full Stack Engineer", "Platform Engineer", "Infrastructure Engineer",
  "Engineering Manager", "Tech Lead", "Principal Engineer",
];

// ============================================================================
// Helpers
// ============================================================================

export const pickRandom = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

export const pickRandomN = <T>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

// ============================================================================
// Generators
// ============================================================================

export const generateCandidate = (id: number): Candidate => {
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

export const generateExternalCandidate = (id: number): Candidate => {
  const candidate = generateCandidate(id);
  return {
    ...candidate,
    id: `cd-ext-${id}`,
    source: "external",
    matchScore: 70 + Math.floor(Math.random() * 30), // 70-100 for external
  };
};

