/**
 * Frontend Job Routes
 * 
 * Routes matching frontend API paths: /jd, /:jdId
 */

import express, { Request, Response } from 'express';
import db from '../../db/db.js';
import { createJob } from '../../services/jobService.js';
import { sourceCandidatesForJob } from '../../services/sourcingService.js';
import { adaptJobToFrontend, adaptJobsToFrontend } from '../../utils/frontendAdapter.js';
import { adaptJobInputToBackend, adaptJobUpdateToBackend } from '../../utils/backendAdapter.js';
import type { Job as BackendJob } from '../../types/index.js';
import { RabbitMqService } from '../../services/rabbitMqService.js';

const router = express.Router();

// GET /jd - List all jobs (frontend format)
router.get('/jd', async (req: Request, res: Response) => {
    try {
        const jobs = db.getAllJobs();
        const frontendJobs = await adaptJobsToFrontend(jobs);
        res.status(200).json(frontendJobs);
    } catch (error: any) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /jd - Create a new job (frontend format)
router.post('/jd', async (req: Request, res: Response) => {
    try {
        const frontendJob = req.body;

        // Transform frontend input to backend format
        const backendInput = adaptJobInputToBackend(frontendJob);

        // Create job using existing service
        const newBackendJob = await createJob(
            backendInput.jd_text,
            backendInput.job_title,
            backendInput.company_name
        );

        // If extracted_keywords were provided, update them
        if (backendInput.extracted_keywords) {
            db.updateJob(newBackendJob.jobId, {
                extracted_keywords: backendInput.extracted_keywords,
            });
        }

        // Automatically source candidates when job is created
        console.log(`[Frontend API] Auto-sourcing candidates for new job: ${newBackendJob.jobId}`);
        try {
            const profiles = await sourceCandidatesForJob(newBackendJob);
            const savedCount = await db.addOrUpdateCandidates(profiles);
            console.log(`[Frontend API] Auto-sourced and saved ${savedCount} candidates for job ${newBackendJob.jobId}`);
        } catch (sourcingError) {
            console.warn(`[Frontend API] Failed to auto-source candidates (non-critical):`, sourcingError);
            // Don't fail job creation if sourcing fails
        }

        // Store frontend-specific fields
        const updates: any = {};
        if (frontendJob.pipelineStages) {
            updates.pipelineStages = frontendJob.pipelineStages;
        }
        if (frontendJob.message) {
            updates.message = frontendJob.message;
        }
        if (Object.keys(updates).length > 0) {
            db.updateJob(newBackendJob.jobId, updates);
        }

        // Get updated job and transform to frontend format
        const updatedJob = db.getJobById(newBackendJob.jobId);
        if (!updatedJob) {
            return res.status(500).json({ message: 'Failed to retrieve created job' });
        }

        const candidates = await db.getCandidatesByJobId(updatedJob.jobId);
        const frontendJobResponse = adaptJobToFrontend(updatedJob, candidates.length);

        const newJob = await createJob(backendInput.jd_text, backendInput.job_title, backendInput.company_name);

        const newJobPost = {
            id: newJob.jobId, // Simple ID gen
            companyName: backendInput.company_name!.toLowerCase(),
            role: backendInput.job_title.replace('Senior ', '').toLowerCase(),
            description: backendInput.jd_text,
        }

        await RabbitMqService.publishJob(newJobPost);

        res.status(201).json(frontendJobResponse);
    } catch (error: any) {
        console.error('Error creating job:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /:jdId - Get job by ID (frontend format)
router.get('/:jdId', async (req: Request, res: Response) => {
    try {
        const { jdId } = req.params;
        const job = db.getJobById(jdId);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const candidates = await db.getCandidatesByJobId(jdId);
        const frontendJob = adaptJobToFrontend(job, candidates.length);

        res.status(200).json(frontendJob);
    } catch (error: any) {
        console.error('Error fetching job:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /:jdId - Update job (frontend format)
router.put('/:jdId', async (req: Request, res: Response) => {
    try {
        const { jdId } = req.params;
        const frontendUpdate = req.body;

        const existingJob = db.getJobById(jdId);
        if (!existingJob) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Transform frontend update to backend format
        const backendUpdate = adaptJobUpdateToBackend(frontendUpdate, existingJob);

        // Update job
        const updatedJob = db.updateJob(jdId, backendUpdate);
        if (!updatedJob) {
            return res.status(500).json({ message: 'Failed to update job' });
        }

        // Transform to frontend format
        const candidates = await db.getCandidatesByJobId(jdId);
        const frontendJob = adaptJobToFrontend(updatedJob, candidates.length);

        res.status(200).json(frontendJob);
    } catch (error: any) {
        console.error('Error updating job:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
