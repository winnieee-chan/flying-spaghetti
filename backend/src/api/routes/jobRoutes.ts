import express, { Request, Response } from 'express';
import db from '../../db/db.js';
import type { Job } from '../../types/index.js';

const router = express.Router();

interface JobRequest extends Request {
    jobId: string;
    job: Job;
}

router.param('jobId', (req: JobRequest, res: Response, next: express.NextFunction, jobId: string) => {
    const job = db.getJobById(jobId);
    if (!job) {
        return res.status(404).json({ message: "Job not found." });
    }
    req.jobId = jobId;
    req.job = job;
    next();
});

router.post('/', async (req: Request, res: Response) => {
    const { jd_text, job_title, company_name } = req.body;

    if (!jd_text || !job_title) {
        return res.status(400).json({ message: "Missing required fields: jd_text, job_title." });
    }

    try {
        const newJob = await db.createJob(jd_text, job_title, company_name);
        res.status(201).json({
            jobId: newJob.jobId,
            status: newJob.status,
            extracted_keywords: newJob.extracted_keywords
        });
    } catch (error) {
        console.error("Error creating job synchronously:", error);
        res.status(500).json({ message: "Internal server error during synchronous job processing." });
    }
});

router.get('/:jobId', (req: JobRequest, res: Response) => {
    const job = req.job;
    res.status(200).json({
        jobId: job.jobId,
        status: job.status,
        extracted_keywords: job.extracted_keywords,
        scoring_ratios: job.scoring_ratios
    });
});

router.put('/:jobId', (req: JobRequest, res: Response) => {
    const { extracted_keywords, scoring_ratios } = req.body;

    if (!extracted_keywords || !scoring_ratios) {
        return res.status(400).json({ message: "Missing required fields: extracted_keywords or scoring_ratios." });
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

router.get('/:jobId/candidates', (req: JobRequest, res: Response) => {
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

router.get('/:jobId/candidates/:candidateId', (req: JobRequest, res: Response) => {
    const { candidateId } = req.params;
    const candidateData = db.getCandidateScoreForJob(candidateId, req.jobId);

    if (!candidateData) {
        return res.status(404).json({ message: "Candidate not found for this job." });
    }

    res.status(200).json(candidateData);
});

router.post('/:jobId/candidates/sendall', (req: JobRequest, res: Response) => {
    const candidates = db.getCandidatesByJobId(req.jobId);
    
    if (candidates.length === 0) {
        return res.status(404).json({ message: "No candidates found for this job." });
    }

    const results = candidates.map(candidate => {
        const candidateDetail = db.getCandidateScoreForJob(candidate.candidateId, req.jobId);
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

router.post('/:jobId/candidates/:candidateId/send', (req: JobRequest, res: Response) => {
    const { candidateId } = req.params;
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

