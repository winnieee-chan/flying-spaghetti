import express, { Request, Response, NextFunction } from 'express';
import db from '../../db/db.js';
import { createJob } from '../../services/jobService.js';
import { sourceCandidatesForJob } from '../../services/sourcingService.js';
import type { Candidate, Job } from '../../types/index.js';
import { RabbitMqService } from '../../services/rabbitMqService.js';
import { readJsonFile } from '../../utils/readJson.js';
import { writeJsonFile } from '../../utils/writeJson.js';
import { CANDIDATE_FILE_PATH, generateUUID } from '../../utils/utils.js';


const router = express.Router();

router.post('/candidates/:candidateId/filter', async (req: Request, res: Response) => {
    try {
        const { companyNames, jobRoles, keywords } = req.body;
        const candidateId = req.params.candidateId;

        const candidates = await readJsonFile<Candidate[]>(CANDIDATE_FILE_PATH);
        const candidateIdx = candidates!.findIndex(candidate => candidate._id === candidateId);

        if (candidateIdx === -1) {
            return res.status(404).json({
                message: "Not found."
            })
        };

        const uuid = generateUUID();

        candidates![candidateIdx].notificationSettings.push({
            id: uuid,
            companyNames,
            jobRoles,
            keywords
        });

        await writeJsonFile(CANDIDATE_FILE_PATH, candidates);

        res.status(201).json({ message: 'success' });

    } catch (error: any) {
        console.error('Error analyzing candidate:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

router.get('/candidates/:candidateId/filter', async (req: Request, res: Response) => {
    try {
        const candidateId = req.params.candidateId;

        const candidates = await readJsonFile<Candidate[]>(CANDIDATE_FILE_PATH);
        const candidateIdx = candidates!.findIndex(candidate => candidate._id === candidateId);

        if (candidateIdx === -1) {
            return res.status(404).json({
                message: "Not found."
            })
        };     

        const candidate = candidates![candidateIdx];

        return res.status(200).json({
            notificationFilters: candidate.notificationSettings
        });
    } catch (error: any) {
        console.error('Error analyzing candidate:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

router.delete('/candidates/:candidateId/filters/:filterId', async (req: Request, res: Response) => {
    try {
        const candidateId = req.params.candidateId;

        const candidates = await readJsonFile<Candidate[]>(CANDIDATE_FILE_PATH);
        const candidateIdx = candidates!.findIndex(candidate => candidate._id === candidateId);

        if (candidateIdx === -1) {
            return res.status(404).json({
                message: "Not found."
            })
        };  

        const notificationsFilters = candidates![candidateIdx].notificationSettings;
        const filterId = req.params.filterId;

        const deleteIdx = notificationsFilters!.findIndex(filter => filter.id === filterId);

        if (deleteIdx === -1) {
            return res.status(404).json({
                message: "Not found."
            })
        };  

        notificationsFilters.splice(deleteIdx, 1);

        candidates![candidateIdx].notificationSettings = notificationsFilters;

        await writeJsonFile(CANDIDATE_FILE_PATH, candidates);

        res.status(204).json();

    } catch (error: any) {
        console.error('Error analyzing candidate:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

router.put('/candidates/:candidateId/filters/:filterId', async (req: Request, res: Response) => {
    try {
        const { companyNames, jobRoles, keywords } = req.body;
        const candidateId = req.params.candidateId;

        const candidates = await readJsonFile<Candidate[]>(CANDIDATE_FILE_PATH);
        const candidateIdx = candidates!.findIndex(candidate => candidate._id === candidateId);

        if (candidateIdx === -1) {
            return res.status(404).json({
                message: "Not found."
            })
        };  

        const notificationsFilters = candidates![candidateIdx].notificationSettings;
        const filterId = req.params.filterId;

        const updateIdx = notificationsFilters!.findIndex(filter => filter.id === filterId);

        if (updateIdx === -1) {
            return res.status(404).json({
                message: "Not found."
            })
        };  

        const oldNotification = notificationsFilters[updateIdx];

        const newNotificationFilter = {
            id: oldNotification.id,
            companyNames,
            jobRoles,
            keywords
        }

        notificationsFilters[updateIdx] = newNotificationFilter

        candidates![candidateIdx].notificationSettings = notificationsFilters;

        await writeJsonFile(CANDIDATE_FILE_PATH, candidates);

        res.status(200).json({
            message: 'Success'
        });

    } catch (error: any) {
        console.error('Error analyzing candidate:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

router.get('/candidates/:candidateId/notifications', async (req: Request, res: Response) => {
    try {
        const candidates = await readJsonFile<Candidate[]>(CANDIDATE_FILE_PATH);
        const { candidateId } = req.params;

        const candidateIdx = candidates!.findIndex(candidate => candidate._id === candidateId);

        if (candidateIdx === -1) {
            return res.status(404).json({
                message: "Not found."
            })
        }

        res.status(200).json({
            emails: candidates![candidateIdx].mailbox
        })



    } catch (error: any) {
        console.error('Error analyzing candidate:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

export default router;