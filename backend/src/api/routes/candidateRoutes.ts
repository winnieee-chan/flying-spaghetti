import express, { Request, Response } from 'express';
import db from '../../db/db.js';

const router = express.Router();

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

export default router;

