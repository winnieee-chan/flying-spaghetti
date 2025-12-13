import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Job, Candidate, CandidateScore, ExtractedKeywords, JobUpdate } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JOBS_FILE = path.join(__dirname, '../data/jobs.json');
const CANDIDATES_FILE = path.join(__dirname, '../data/candidates.json');

const readJobsFile = (): Job[] => {
    try {
        const data = fs.readFileSync(JOBS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.warn("jobs.json not found. Creating empty array.");
            return [];
        }
        console.error("Error reading jobs.json:", error);
        return [];
    }
};

const writeJobsFile = (jobs: Job[]): void => {
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf8');
};

const readCandidatesFile = (): Candidate[] => {
    try {
        const data = fs.readFileSync(CANDIDATES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.warn("candidates.json not found. Creating empty array.");
            return [];
        }
        console.error("Error reading candidates.json:", error);
        return [];
    }
};

const writeCandidatesFile = (candidates: Candidate[]): void => {
    fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(candidates, null, 2), 'utf8');
};

const runSynchronousLLM = async (jd_text: string, job_title: string): Promise<ExtractedKeywords> => {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-pro';
    
    if (!apiKey) {
        console.warn('[LLM] GEMINI_API_KEY not found. Using fallback mock extraction.');
        return {
            role: job_title || "Software Engineer",
            skills: ["Python", "FastAPI", "Postgres"],
            min_experience_years: 5,
            location: "Sydney"
        };
    }

    try {
        console.log(`[LLM] Calling Google Gemini API (${modelName}) for: ${job_title}...`);
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `Extract key information from the following job description and return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just the JSON):

{
  "role": "job title or role name",
  "skills": ["skill1", "skill2", "skill3"],
  "min_experience_years": number,
  "location": "city or location name"
}

Job Title: ${job_title}
Job Description:
${jd_text}

Return only the JSON object, nothing else.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        let jsonText = text;
        if (text.startsWith('```json')) {
            jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        } else if (text.startsWith('```')) {
            jsonText = text.replace(/```\n?/g, '').trim();
        }

        const extracted = JSON.parse(jsonText) as Partial<ExtractedKeywords>;

        return {
            role: extracted.role || job_title || "Software Engineer",
            skills: Array.isArray(extracted.skills) ? extracted.skills : ["Python", "FastAPI", "Postgres"],
            min_experience_years: extracted.min_experience_years || 3,
            location: extracted.location || "Remote"
        };

    } catch (error: any) {
        console.error('[LLM] Error calling Gemini API:', error.message);
        console.log('[LLM] Falling back to mock extraction.');
        return {
            role: job_title || "Software Engineer",
            skills: ["Python", "FastAPI", "Postgres"],
            min_experience_years: 5,
            location: "Sydney"
        };
    }
};

const db = {
    createJob: async (jd_text: string, job_title: string, company_name?: string): Promise<Job> => {
        const extracted_keywords = await runSynchronousLLM(jd_text, job_title);
        const jobs = readJobsFile();
        const jobId = randomUUID();
        
        const newJob: Job = {
            jobId,
            jd_text,
            job_title,
            company_name,
            status: 'PROCESSED_KEYWORDS',
            extracted_keywords,
            scoring_ratios: {
                startup_exp_weight: 0.3,
                oss_activity_weight: 0.5,
                tech_match_weight: 0.2
            },
            recruiterId: 1, 
            createdAt: new Date().toISOString(),
        };

        jobs.push(newJob);
        writeJobsFile(jobs);
        return newJob;
    },

    getJobById: (jobId: string): Job | undefined => {
        const jobs = readJobsFile();
        return jobs.find(job => job.jobId === jobId);
    },

    updateJob: (jobId: string, updates: JobUpdate): Job | null => {
        const jobs = readJobsFile();
        const index = jobs.findIndex(job => job.jobId === jobId);

        if (index === -1) {
            return null;
        }

        Object.assign(jobs[index], updates);
        writeJobsFile(jobs);
        return jobs[index];
    },

    getCandidatesByJobId: (jobId: string): CandidateScore[] => {
        const candidates = readCandidatesFile();
        return candidates
            .map(candidate => {
                const scoreData = candidate.scores.find(s => s.job_id === jobId);
                if (!scoreData) return null;
                
                return {
                    candidateId: candidate._id,
                    full_name: candidate.full_name,
                    headline: candidate.headline,
                    github_username: candidate.github_username,
                    open_to_work: candidate.open_to_work,
                    score: scoreData.score,
                    breakdown_json: scoreData.breakdown_json,
                    enrichment: candidate.enrichment
                };
            })
            .filter((c): c is CandidateScore => c !== null);
    },

    getCandidateById: (candidateId: string): Candidate | undefined => {
        const candidates = readCandidatesFile();
        return candidates.find(c => c._id === candidateId);
    },

    getCandidateScoreForJob: (candidateId: string, jobId: string): CandidateScore | null => {
        const candidates = readCandidatesFile();
        const candidate = candidates.find(c => c._id === candidateId);
        if (!candidate) return null;
        
        const scoreData = candidate.scores.find(s => s.job_id === jobId);
        if (!scoreData) return null;
        
        return {
            candidateId: candidate._id,
            full_name: candidate.full_name,
            headline: candidate.headline,
            github_username: candidate.github_username,
            open_to_work: candidate.open_to_work,
            score: scoreData.score,
            breakdown_json: scoreData.breakdown_json,
            outreach_messages: scoreData.outreach_messages,
            enrichment: candidate.enrichment
        };
    }
};

export default db;

