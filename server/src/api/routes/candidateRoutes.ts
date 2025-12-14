import express, { Request, Response } from 'express';
import db from '../../db/db.js';

const router = express.Router();

// POST /candidates/:candidateId/send - Send a job message to a candidate
router.post('/:candidateId/send', (req: Request, res: Response) => {
    const { candidateId } = req.params;
    const { jobId } = req.body;

    if (!jobId) {
        return res.status(400).json({ message: "Missing required field: jobId." });
    }

    const candidateData = db.getCandidateScoreForJob(candidateId, jobId);

    if (!candidateData) {
        return res.status(404).json({ message: "Candidate not found for this job." });
    }

    const message = candidateData.outreach_messages?.[0] || `Hi ${candidateData.full_name}, we'd like to connect...`;

    res.status(200).json({
        candidateId: candidateId,
        jobId: jobId,
        full_name: candidateData.full_name,
        email_sent: true,
        message: message
    });
});

// GET /candidates/:candidateId - Get candidate full profile
router.get('/:candidateId', (req: Request, res: Response) => {
    const { candidateId } = req.params;

    const candidate = db.getCandidateById(candidateId);

    if (!candidate) {
        return res.status(404).json({ message: "Candidate not found." });
    }

    res.status(200).json({
        candidateId: candidate._id,
        full_name: candidate.full_name,
        headline: candidate.headline,
        github_username: candidate.github_username,
        open_to_work: candidate.open_to_work,
        enrichment: candidate.enrichment,
        scores: candidate.scores?.map(score => ({
            job_id: score.job_id,
            score: score.score,
            breakdown_json: score.breakdown_json
        })) || []
    });
});

// GET /candidates - Get all candidates (optional: with filters)
router.get('/', (req: Request, res: Response) => {
    const { open_to_work, min_score, job_id } = req.query;

    // If job_id is provided, get candidates for that job
    if (job_id && typeof job_id === 'string') {
        let candidates = db.getCandidatesByJobId(job_id);

        if (open_to_work === 'true') {
            candidates = candidates.filter(c => c.open_to_work);
        } else if (open_to_work === 'false') {
            candidates = candidates.filter(c => !c.open_to_work);
        }

        if (min_score && typeof min_score === 'string') {
            const minScoreNum = parseFloat(min_score);
            candidates = candidates.filter(c => c.score >= minScoreNum);
        }

        return res.status(200).json({
            job_id,
            count: candidates.length,
            candidates: candidates.map(c => ({
                candidateId: c.candidateId,
                full_name: c.full_name,
                headline: c.headline,
                github_username: c.github_username,
                score: c.score,
                open_to_work: c.open_to_work
            }))
        });
    }

    // If no job_id, this would require a new db method to get all candidates
    return res.status(400).json({
        message: "Please provide job_id parameter to filter candidates"
    });
});

export default router;

