// src/db/db.ts (Data Access Object - DAO)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';


import type { Job, Candidate, CandidateScore, JobUpdate } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JOBS_FILE = path.join(__dirname, '../data/jobs.json');
const CANDIDATES_FILE = path.join(__dirname, '../data/candidates.json');

// --- File I/O Helpers ---
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


const db = {
    // 1. CRUD: Save Job (Renamed from createJob to clarify DAO role)
    saveNewJob: (newJob: Job): void => {
        const jobs = readJobsFile();
        jobs.push(newJob);
        writeJobsFile(jobs);
    },

    // 2. CRUD: Get Job
    getJobById: (jobId: string): Job | undefined => {
        const jobs = readJobsFile();
        return jobs.find(job => job.jobId === jobId);
    },

    // 3. CRUD: Update Job
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

    // 4. Read: Get Candidates Scored for Job
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

    // 5. Read: Get Specific Candidate Score Data
    getCandidateScoreForJob: (candidateId: string, jobId: string): CandidateScore | null => {
        const candidates = readCandidatesFile();
        const candidate = candidates.find(c => c._id === candidateId);
        if (!candidate) return null;
        
        const scoreData = candidate.scores?.find(s => s.job_id === jobId);
        if (!scoreData) return null;

        // This structure assumes CandidateScore includes all detailed fields needed for the frontend
        return {
            candidateId: candidate._id,
            full_name: candidate.full_name,
            headline: candidate.headline || '',
            github_username: candidate.github_username,
            open_to_work: candidate.open_to_work,
            score: scoreData.score,
            breakdown_json: scoreData.breakdown_json,
            outreach_messages: scoreData.outreach_messages,
            enrichment: candidate.enrichment
        };
    },

    // 6. Read: Get Candidate by ID (without job context)
    getCandidateById: (candidateId: string): Candidate | undefined => {
        const candidates = readCandidatesFile();
        return candidates.find(c => c._id === candidateId);
    },

    // 7. Read: Get All Candidates (for searching/filtering)
    getAllCandidates: (): any[] => {
        return readCandidatesFile();
    },

    // 7. Write: Save or Update Candidate Score for a Job
    /**
     * Saves or updates the scoring results and details for a specific candidate on a specific job.
     * @param candidateId The unique ID of the candidate.
     * @param jobId The job ID the score relates to.
     * @param score The final calculated score (0-100).
     * @param scoreDetails Partial CandidateScore object containing breakdown, outreach messages, etc.
     */
    saveCandidateScore: (candidateId: string, jobId: string, score: number, scoreDetails: Partial<CandidateScore>): void => {
        const candidates = readCandidatesFile();
        let candidate = candidates.find(c => c._id === candidateId);

        // 1. Candidate Creation/Lookup
        if (!candidate) {
            // If candidate doesn't exist, create a new record
            candidate = {
                _id: candidateId,
                full_name: scoreDetails.full_name || 'N/A',
                headline: scoreDetails.headline || '',
                github_username: scoreDetails.github_username || '',
                open_to_work: scoreDetails.open_to_work || false,
                enrichment: scoreDetails.enrichment || {
                    public_repos: 0,
                    total_stars: 0,
                    recent_activity_days: 0,
                    updated_at: new Date().toISOString()
                },
                scores: []
            } as unknown as Candidate;
            candidates.push(candidate);
        }

        // 2. Score Array Management: Remove old score for this job, if it exists
        candidate.scores = candidate.scores.filter(s => s.job_id !== jobId);

        // 3. Add the new score and all details
        candidate.scores.push({
            job_id: jobId,
            score: score,
            breakdown_json: scoreDetails.breakdown_json || [],
            outreach_messages: scoreDetails.outreach_messages || []
        });

        // 4. Persistence: Write the updated array back to the file
        writeCandidatesFile(candidates);
    }
};

export default db;