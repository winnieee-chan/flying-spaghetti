/**
 * Frontend AI Routes
 * 
 * Routes matching frontend API paths: /:jobId/cd/:candidateId/ai/*
 */

import express, { Request, Response } from 'express';
import * as aiService from '../../services/aiService.js';

const router = express.Router();

// POST /:jobId/cd/:candidateId/ai/analyze - Analyze candidate
router.post('/:jobId/cd/:candidateId/ai/analyze', async (req: Request, res: Response) => {
    try {
        const { jobId, candidateId } = req.params;
        const result = await aiService.analyzeCandidate(jobId, candidateId);
        res.status(200).json(result);
    } catch (error: any) {
        console.error('Error analyzing candidate:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

// POST /:jobId/cd/:candidateId/ai/draft-message - Draft first message
router.post('/:jobId/cd/:candidateId/ai/draft-message', async (req: Request, res: Response) => {
    try {
        const { jobId, candidateId } = req.params;
        const message = await aiService.draftFirstMessage(jobId, candidateId);
        res.status(200).json(message);
    } catch (error: any) {
        console.error('Error drafting message:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

// POST /:jobId/cd/:candidateId/ai/summarize-conversation - Summarize conversation
router.post('/:jobId/cd/:candidateId/ai/summarize-conversation', async (req: Request, res: Response) => {
    try {
        const { jobId, candidateId } = req.params;
        const summary = await aiService.summarizeConversation(jobId, candidateId);
        res.status(200).json(summary);
    } catch (error: any) {
        console.error('Error summarizing conversation:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

// POST /:jobId/cd/:candidateId/ai/suggest-message - Suggest next message
router.post('/:jobId/cd/:candidateId/ai/suggest-message', async (req: Request, res: Response) => {
    try {
        const { jobId, candidateId } = req.params;
        const { lastMessage } = req.body;

        if (!lastMessage || typeof lastMessage !== 'string') {
            return res.status(400).json({ message: 'lastMessage is required' });
        }

        const message = await aiService.suggestNextMessage(jobId, candidateId, lastMessage);
        res.status(200).json(message);
    } catch (error: any) {
        console.error('Error suggesting message:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

// POST /:jobId/cd/:candidateId/ai/suggest-times - Suggest interview times
router.post('/:jobId/cd/:candidateId/ai/suggest-times', async (req: Request, res: Response) => {
    try {
        const { jobId, candidateId } = req.params;
        const times = await aiService.suggestInterviewTimes(jobId, candidateId);
        // Convert dates to ISO strings for JSON
        const timeStrings = times.map(date => date.toISOString());
        res.status(200).json(timeStrings);
    } catch (error: any) {
        console.error('Error suggesting times:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

// POST /:jobId/cd/:candidateId/ai/draft-offer - Draft offer letter
router.post('/:jobId/cd/:candidateId/ai/draft-offer', async (req: Request, res: Response) => {
    try {
        const { jobId, candidateId } = req.params;
        const { terms } = req.body;
        const offer = await aiService.draftOffer(jobId, candidateId, terms);
        res.status(200).json(offer);
    } catch (error: any) {
        console.error('Error drafting offer:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

// POST /:jobId/cd/:candidateId/ai/negotiate - Help negotiate
router.post('/:jobId/cd/:candidateId/ai/negotiate', async (req: Request, res: Response) => {
    try {
        const { jobId, candidateId } = req.params;
        const { request } = req.body;

        if (!request || typeof request !== 'string') {
            return res.status(400).json({ message: 'request is required' });
        }

        const response = await aiService.helpNegotiate(jobId, candidateId, request);
        res.status(200).json(response);
    } catch (error: any) {
        console.error('Error negotiating:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

// POST /:jobId/cd/:candidateId/ai/decision-summary - Generate decision summary
router.post('/:jobId/cd/:candidateId/ai/decision-summary', async (req: Request, res: Response) => {
    try {
        const { jobId, candidateId } = req.params;
        const { decision } = req.body;

        if (!decision || (decision !== 'hire' && decision !== 'reject')) {
            return res.status(400).json({ message: 'decision must be "hire" or "reject"' });
        }

        const summary = await aiService.generateDecisionSummary(jobId, candidateId, decision);
        res.status(200).json(summary);
    } catch (error: any) {
        console.error('Error generating decision summary:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

export default router;
