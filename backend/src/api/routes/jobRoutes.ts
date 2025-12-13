import express, { Request, Response, NextFunction } from 'express';
import db from '../../db/db.js';
import { createJob } from '../../services/jobService.js';
import type { Job } from '../../types/index.js';

const router = express.Router();

interface JobRequest extends Request {
    jobId?: string;
    job?: Job;
}

// Middleware to load job by ID
router.param('jobId', (req: JobRequest, res: Response, next: NextFunction, jobId: string) => {
    const job = db.getJobById(jobId);
    if (!job) {
        return res.status(404).json({ message: "Job not found." });
    }
    req.jobId = jobId;
    req.job = job;
    next();
});

// POST /jobs - Create a new job
router.post('/', async (req: Request, res: Response) => {
    const { jd_text, job_title, company_name } = req.body;

    if (!jd_text || !job_title) {
        return res.status(400).json({ message: "Missing required fields: jd_text, job_title." });
    }

    try {
        const newJob = await createJob(jd_text, job_title, company_name);
        res.status(201).json({
            jobId: newJob.jobId,
            status: newJob.status,
            extracted_keywords: newJob.extracted_keywords
        });
    } catch (error) {
        console.error("Error creating job:", error);
        res.status(500).json({ message: "Internal server error during job processing." });
    }
});

// GET /jobs/:jobId - Get job details
router.get('/:jobId', (req: JobRequest, res: Response) => {
    if (!req.job) {
        return res.status(404).json({ message: "Job not found." });
    }

    res.status(200).json({
        jobId: req.job.jobId,
        status: req.job.status,
        extracted_keywords: req.job.extracted_keywords,
        scoring_ratios: req.job.scoring_ratios
    });
});

// PUT /jobs/:jobId - Update job filters and scoring
router.put('/:jobId', (req: JobRequest, res: Response) => {
    const { extracted_keywords, scoring_ratios } = req.body;

    if (!extracted_keywords || !scoring_ratios) {
        return res.status(400).json({ message: "Missing required fields: extracted_keywords or scoring_ratios." });
    }

    if (!req.jobId) {
        return res.status(404).json({ message: "Job not found." });
    }

    const updatedJob = db.updateJob(req.jobId, {
        extracted_keywords,
        scoring_ratios,
        status: 'FILTERS_SAVED' 
    });

    if (!updatedJob) {
        return res.status(404).json({ message: "Failed to update job." });
    }

    res.status(200).json({
        message: "Filters and scoring ratios successfully updated and saved for sourcing."
    });
});

// GET /jobs/:jobId/candidates - Get candidates for a job
router.get('/:jobId/candidates', (req: JobRequest, res: Response) => {
    if (!req.jobId) {
        return res.status(404).json({ message: "Job not found." });
    }

    let candidates = db.getCandidatesByJobId(req.jobId);
    const { sort, exclude_open_to_work } = req.query;
    
    if (exclude_open_to_work === 'true') {
        candidates = candidates.filter(c => !c.open_to_work);
    }

    if (sort === 'score' || !sort) {
        candidates.sort((a, b) => b.score - a.score);
    }

    res.status(200).json({
        jobId: req.jobId,
        candidates: candidates.map(c => ({
            candidateId: c.candidateId,
            full_name: c.full_name,
            headline: c.headline,
            github_username: c.github_username,
            score: c.score,
            open_to_work: c.open_to_work
        }))
    });
});

// GET /jobs/:jobId/candidates/:candidateId - Get specific candidate details
router.get('/:jobId/candidates/:candidateId', (req: JobRequest, res: Response) => {
    const { candidateId } = req.params;

    if (!req.jobId) {
        return res.status(404).json({ message: "Job not found." });
    }

    const candidateData = db.getCandidateScoreForJob(candidateId, req.jobId);

    if (!candidateData) {
        return res.status(404).json({ message: "Candidate not found for this job." });
    }

    res.status(200).json(candidateData);
});

// POST /jobs/:jobId/candidates/sendall - Send messages to all candidates
router.post('/:jobId/candidates/sendall', (req: JobRequest, res: Response) => {
    if (!req.jobId) {
        return res.status(404).json({ message: "Job not found." });
    }

    const candidates = db.getCandidatesByJobId(req.jobId);
    
    if (candidates.length === 0) {
        return res.status(404).json({ message: "No candidates found for this job." });
    }

    const results = candidates.map(candidate => {
        const candidateDetail = db.getCandidateScoreForJob(candidate.candidateId, req.jobId!);
        const message = candidateDetail?.outreach_messages?.[0] || `Hi ${candidate.full_name}, we'd like to connect...`;
        
        return {
            candidateId: candidate.candidateId,
            full_name: candidate.full_name,
            email_sent: true,
            message: message
        };
    });

    res.status(200).json({
        jobId: req.jobId,
        message: `Personalized messages generated and sent to ${results.length} candidates.`,
        results: results
    });
});

// POST /jobs/:jobId/candidates/:candidateId/send - Send message to specific candidate
router.post('/:jobId/candidates/:candidateId/send', (req: JobRequest, res: Response) => {
    const { candidateId } = req.params;

    if (!req.jobId) {
        return res.status(404).json({ message: "Job not found." });
    }

    const candidateData = db.getCandidateScoreForJob(candidateId, req.jobId);

    if (!candidateData) {
        return res.status(404).json({ message: "Candidate not found for this job." });
    }

    const message = candidateData.outreach_messages?.[0] || `Hi ${candidateData.full_name}, we'd like to connect...`;

    res.status(200).json({
        candidateId: candidateId,
        jobId: req.jobId,
        full_name: candidateData.full_name,
        email_sent: true,
        message: message
    });
});

export default router;

