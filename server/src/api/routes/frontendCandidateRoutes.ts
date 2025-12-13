/**
 * Frontend Candidate Routes
 * 
 * Routes matching frontend API paths: /:jdId/cd, /:jobId/cd/:candidateId/*
 */

import express, { Request, Response } from 'express';
import db from '../../db/db.js';
import { adaptCandidatesToFrontend, adaptCandidateToFrontend } from '../../utils/frontendAdapter.js';
import { randomUUID } from 'crypto';

const router = express.Router();

// GET /:jdId/cd - Get candidates for a job (frontend format)
router.get('/:jdId/cd', async (req: Request, res: Response) => {
    try {
        const { jdId } = req.params;
        
        // Get candidates from backend
        const candidateScores = await db.getCandidatesByJobId(jdId);
        
        // Get full candidate data
        const backendCandidatesPromises = candidateScores.map(score => 
            db.getCandidateById(score.candidateId)
        );
        const backendCandidates = (await Promise.all(backendCandidatesPromises))
            .filter((c): c is NonNullable<typeof c> => c !== undefined);

        // Transform to frontend format
        const frontendCandidates = adaptCandidatesToFrontend(candidateScores, backendCandidates);

        res.status(200).json(frontendCandidates);
    } catch (error: any) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /:jobId/cd/external-search - Search external candidates
router.post('/:jobId/cd/external-search', (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;
        const { query } = req.body;

        // For now, generate mock external candidates
        // In production, this would search external APIs
        const mockExternalCandidates = generateMockExternalCandidates(query, 4);

        // Add candidates to the job (create score entries)
        // Note: In a real implementation, you'd add these to the database
        // For now, we'll just return them without persisting
        
        // Transform to frontend format
        const frontendCandidates = mockExternalCandidates.map(candidate => ({
            id: candidate.id,
            name: candidate.name,
            email: candidate.email,
            experience: candidate.experience,
            location: candidate.location,
            skills: candidate.skills,
            headline: candidate.headline,
            status: "External",
            matchScore: candidate.matchScore,
            source: "external" as const,
            pipelineStage: "new" as const,
        }));

        res.status(200).json(frontendCandidates);
    } catch (error: any) {
        console.error('Error searching external candidates:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /:jobId/cd/:candidateId/stage - Update candidate pipeline stage
router.put('/:jobId/cd/:candidateId/stage', async (req: Request, res: Response) => {
    try {
        const { jobId, candidateId } = req.params;
        const { stageId } = req.body;

        // Validate stageId
        const validStages = ["new", "engaged", "closing"];
        if (!validStages.includes(stageId)) {
            return res.status(400).json({ message: 'Invalid stage ID. Must be one of: new, engaged, closing' });
        }

        // Update pipeline stage
        const success = await db.updateCandidatePipelineStage(candidateId, jobId, stageId);
        
        if (!success) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Error updating candidate stage:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /:jobId/cd/batch-move - Batch move candidates by match score
router.post('/:jobId/cd/batch-move', async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;
        const { criteria, targetStageId } = req.body;

        // Validate targetStageId
        const validStages = ["new", "engaged", "closing"];
        if (!targetStageId || !validStages.includes(targetStageId)) {
            return res.status(400).json({ message: 'Invalid target stage ID' });
        }

        // Get all candidates for this job
        const candidateScores = await db.getCandidatesByJobId(jobId);

        // Filter candidates by criteria
        const candidatesToMove = candidateScores.filter(score => {
            const matchScore = score.score;
            let shouldMove = false;

            if (criteria.minMatchScore !== undefined && criteria.maxMatchScore !== undefined) {
                shouldMove = matchScore >= criteria.minMatchScore && matchScore <= criteria.maxMatchScore;
            } else if (criteria.minMatchScore !== undefined) {
                shouldMove = matchScore >= criteria.minMatchScore;
            } else if (criteria.maxMatchScore !== undefined) {
                shouldMove = matchScore <= criteria.maxMatchScore;
            } else {
                // If no criteria, move all
                shouldMove = true;
            }

            return shouldMove;
        });

        // Update pipeline stages for matching candidates
        const candidateIds = candidatesToMove.map(c => c.candidateId);
        const count = await db.batchUpdateCandidateStages(jobId, candidateIds, targetStageId);

        res.status(200).json({ count });
    } catch (error: any) {
        console.error('Error batch moving candidates:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /:jobId/cd/:candidateId/messages - Send message to candidate
router.post('/:jobId/cd/:candidateId/messages', async (req: Request, res: Response) => {
    try {
        const { jobId, candidateId } = req.params;
        const { content } = req.body;

        if (!content || typeof content !== 'string') {
            return res.status(400).json({ message: 'Message content is required' });
        }

        // Create message object
        const message = {
            id: `msg-${Date.now()}-${randomUUID().substring(0, 8)}`,
            from: "founder" as const,
            content,
            timestamp: new Date().toISOString(),
            aiDrafted: false,
        };

        // Add message to conversation history
        const success = await db.addMessageToConversation(candidateId, jobId, message);

        if (!success) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        res.status(200).json({ success: true, messageId: message.id });
    } catch (error: any) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Helper function to generate mock external candidates
function generateMockExternalCandidates(query: string, count: number): Array<{
    id: string;
    name: string;
    email: string;
    experience: string;
    location: string;
    skills: string[];
    headline: string;
    matchScore: number;
}> {
    const names = [
        "Jordan Smith", "Taylor Johnson", "Morgan Williams", "Casey Brown",
        "Riley Davis", "Alex Martinez", "Sam Anderson", "Jamie Wilson"
    ];
    const locations = ["Remote", "Sydney", "Melbourne", "Brisbane", "San Francisco"];
    const skills = [
        ["React", "TypeScript", "Node.js"],
        ["Python", "Django", "PostgreSQL"],
        ["Vue.js", "JavaScript", "MongoDB"],
        ["Go", "Kubernetes", "Docker"],
        ["Java", "Spring", "MySQL"],
    ];

    return Array.from({ length: count }, (_, i) => {
        const name = names[i % names.length];
        const location = locations[i % locations.length];
        const skillSet = skills[i % skills.length];
        const experience = `${2 + (i % 5)} years`;

        return {
            id: `ext-${randomUUID()}`,
            name,
            email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
            experience,
            location,
            skills: skillSet,
            headline: `${name} - ${skillSet[0]} Developer`,
            matchScore: 60 + (i % 30), // Random score between 60-90
        };
    }).filter(candidate => {
        // Filter by query if provided
        if (!query) return true;
        const q = query.toLowerCase();
        return (
            candidate.name.toLowerCase().includes(q) ||
            candidate.headline.toLowerCase().includes(q) ||
            candidate.skills.some(s => s.toLowerCase().includes(q))
        );
    });
}

export default router;
