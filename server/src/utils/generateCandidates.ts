/**
 * Script to generate additional candidate data
 * Run with: npx tsx server/src/utils/generateCandidates.ts
 */

import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Candidate {
  _id: string;
  full_name: string;
  email: string;
  bio: string;
  github_username: string;
  open_to_work: boolean;
  keywords: {
    role: string;
    skills: string[];
    years_of_experience: number;
    location: string;
  };
  notificationSettings: any[];
  headline?: string;
  enrichment?: {
    public_repos: number;
    total_stars: number;
    recent_activity_days: number;
    updated_at: string;
  };
  scores?: any[];
}

const FIRST_NAMES = [
  'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Alex', 'Sam', 'Jamie',
  'Cameron', 'Dakota', 'Quinn', 'Avery', 'Blake', 'Sage', 'River', 'Phoenix',
  'Skylar', 'Rowan', 'Finley', 'Emery', 'Reese', 'Hayden', 'Parker', 'Drew'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas',
  'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Moore', 'Young', 'Lee', 'Walker'
];

const LOCATIONS = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Remote', 'Canberra', 'Darwin'];
const ROLES = ['Software Engineer', 'Backend Engineer', 'Frontend Engineer', 'Full Stack Engineer', 'DevOps Engineer', 'ML Engineer', 'Data Engineer'];

const SKILL_COMBINATIONS: { [key: string]: string[] } = {
  'Python Backend': ['Python', 'FastAPI', 'Postgres', 'Docker', 'REST APIs'],
  'Go Infrastructure': ['Go', 'Kubernetes', 'Redis', 'Docker', 'Terraform'],
  'JavaScript Full Stack': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Postgres'],
  'Python ML': ['Python', 'TensorFlow', 'PyTorch', 'Postgres', 'Docker'],
  'Java Backend': ['Java', 'Spring Boot', 'MySQL', 'Docker', 'Kubernetes'],
  'Node.js Backend': ['Node.js', 'Express', 'MongoDB', 'Docker', 'AWS'],
  'React Frontend': ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
  'Vue Frontend': ['Vue.js', 'JavaScript', 'Nuxt.js', 'CSS', 'Webpack'],
  'DevOps': ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
  'Data Engineering': ['Python', 'Postgres', 'Airflow', 'Spark', 'Docker']
};

const generateBio = (name: string, role: string, skills: string[], location: string, years: number): string => {
  const firstName = name.split(' ')[0];
  const skillList = skills.slice(0, 3).join(', ');
  return `${firstName} is an experienced ${role} with ${years} years of professional experience, currently based in ${location}. Specializing in ${skillList}, ${firstName} has a proven track record of building scalable systems and delivering high-quality software solutions. With expertise in modern development practices and a passion for clean code, ${firstName} brings both technical depth and collaborative spirit to engineering teams.`;
};

const generateHeadline = (role: string, years: number): string => {
  const level = years >= 8 ? 'Principal' : years >= 5 ? 'Senior' : years >= 3 ? 'Mid-level' : 'Junior';
  return `${level} ${role}`;
};

const calculateScore = (jobSkills: string[], candidateSkills: string[], jobExp: number, candidateExp: number, jobLocation: string, candidateLocation: string): { score: number; breakdown: any[] } => {
  const skillMatches = jobSkills.filter(skill => 
    candidateSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs.toLowerCase()))
  ).length;
  const skillMatchScore = (skillMatches / Math.max(jobSkills.length, 1)) * 50;
  
  const expScore = candidateExp >= jobExp ? 30 : Math.max(0, (candidateExp / jobExp) * 30);
  
  const locationMatch = jobLocation.toLowerCase() === 'remote' || 
                       candidateLocation.toLowerCase() === 'remote' ||
                       jobLocation.toLowerCase() === candidateLocation.toLowerCase();
  const locationScore = locationMatch ? 20 : 0;
  
  const totalScore = Math.min(100, Math.round(skillMatchScore + expScore + locationScore));
  
  const breakdown = [
    {
      signal: 'skill_match',
      value: skillMatches,
      reason: `${skillMatches} of ${jobSkills.length} required skills matched`
    },
    {
      signal: 'experience',
      value: candidateExp,
      reason: `${candidateExp} years of experience (required: ${jobExp})`
    },
    {
      signal: 'location',
      value: locationMatch ? 1 : 0,
      reason: `Location: ${candidateLocation} vs ${jobLocation}`
    }
  ];
  
  return { score: totalScore, breakdown };
};

function generateCandidates(count: number, jobs: any[]): Candidate[] {
  const candidates: Candidate[] = [];
  const usedIds = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${['gmail.com', 'outlook.com', 'yahoo.com', 'protonmail.com'][Math.floor(Math.random() * 4)]}`;
    
    const role = ROLES[Math.floor(Math.random() * ROLES.length)];
    const skillKey = Object.keys(SKILL_COMBINATIONS)[Math.floor(Math.random() * Object.keys(SKILL_COMBINATIONS).length)];
    const skills = [...SKILL_COMBINATIONS[skillKey]];
    // Add some random additional skills
    const allSkills = ['Git', 'Agile', 'CI/CD', 'AWS', 'Docker', 'Kubernetes', 'Postgres', 'MongoDB', 'Redis', 'GraphQL', 'REST APIs'];
    const additionalSkills = allSkills.filter(s => !skills.includes(s));
    skills.push(...additionalSkills.slice(0, Math.floor(Math.random() * 3)));
    
    const years = Math.floor(Math.random() * 10) + 1; // 1-10 years
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const openToWork = Math.random() > 0.3; // 70% open to work
    
    const candidateId = randomUUID();
    if (usedIds.has(candidateId)) {
      i--;
      continue;
    }
    usedIds.add(candidateId);
    
    const bio = generateBio(fullName, role, skills, location, years);
    const headline = generateHeadline(role, years);
    const githubUsername = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Math.floor(Math.random() * 1000)}`;
    
    // Generate scores for each job
    const scores = jobs.map(job => {
      const jobSkills = job.extracted_keywords?.skills || [];
      const jobExp = job.extracted_keywords?.min_experience_years || 3;
      const jobLocation = job.extracted_keywords?.location || 'Remote';
      
      const { score, breakdown } = calculateScore(jobSkills, skills, jobExp, years, jobLocation, location);
      
      return {
        job_id: job.jobId,
        score,
        breakdown_json: breakdown,
        outreach_messages: []
      };
    });
    
    const candidate: Candidate = {
      _id: candidateId,
      full_name: fullName,
      email,
      bio,
      github_username: githubUsername,
      open_to_work: openToWork,
      keywords: {
        role,
        skills,
        years_of_experience: years,
        location
      },
      notificationSettings: [],
      headline,
      enrichment: {
        public_repos: Math.floor(Math.random() * 50) + 5,
        total_stars: Math.floor(Math.random() * 500),
        recent_activity_days: Math.floor(Math.random() * 30),
        updated_at: new Date().toISOString()
      },
      scores
    };
    
    candidates.push(candidate);
  }
  
  return candidates;
}

// Main execution
const jobsPath = path.join(__dirname, '../data/jobs.json');
const candidatesPath = path.join(__dirname, '../data/candidates.json');

const jobs = JSON.parse(fs.readFileSync(jobsPath, 'utf-8'));
const existingCandidates = JSON.parse(fs.readFileSync(candidatesPath, 'utf-8'));

console.log(`Existing candidates: ${existingCandidates.length}`);
console.log(`Jobs: ${jobs.length}`);

// Generate 50 new candidates
const newCandidates = generateCandidates(50, jobs);
const allCandidates = [...existingCandidates, ...newCandidates];

fs.writeFileSync(candidatesPath, JSON.stringify(allCandidates, null, 2));
console.log(`Generated ${newCandidates.length} new candidates. Total: ${allCandidates.length}`);
