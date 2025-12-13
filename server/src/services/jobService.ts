// src/services/jobService.ts
import { randomUUID } from 'crypto';
import type { Job } from '../types/index.js';
import db from '../db/db.js';
import { runSynchronousLLM } from './llmService.js';

export const createJob = async (jd_text: string, job_title: string, company_name?: string): Promise<Job> => {
    // 1. Logic: Call LLM (Synchronous Business Logic)
    const extracted_keywords = await runSynchronousLLM(jd_text, job_title);

    // 2. Data Access: Prepare the new job object
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
    
    // 3. DAO: Save the job
    db.saveNewJob(newJob); 
    return newJob;
};

// Placeholder for other job services (e.g., scoring, outreach generation)
// We need a proper scoring implementation for this service.
// This is a minimal mock for now.
export const generateOutreachMessages = async (candidateId: string, jobId: string) => {
    // Placeholder for LLM outreach generation (future step)
    return ["Hi, we saw your amazing work on [OSS Project] and believe you'd be a great fit..."];
};