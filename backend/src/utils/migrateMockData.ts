/**
 * Mock Data Migration Script
 * 
 * Converts frontend mock data structure to backend format.
 * This ensures backend data is compatible with frontend expectations.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Job, Candidate } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JOBS_FILE = path.join(__dirname, '../data/jobs.json');
const CANDIDATES_FILE = path.join(__dirname, '../data/candidates.json');

/**
 * Migrate jobs to include frontend-compatible fields
 */
export const migrateJobs = (): void => {
    const jobs = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8')) as Job[];
    
    const migratedJobs = jobs.map(job => {
        // Add pipelineStages if not present
        if (!job.pipelineStages) {
            job.pipelineStages = [
                { id: "new", name: "New", order: 0 },
                { id: "engaged", name: "Engaged", order: 1 },
                { id: "closing", name: "Closing", order: 2 }
            ];
        }
        
        // Ensure message field exists (optional)
        // message is already optional in the type
        
        return job;
    });
    
    fs.writeFileSync(JOBS_FILE, JSON.stringify(migratedJobs, null, 2), 'utf8');
    console.log(`✅ Migrated ${migratedJobs.length} jobs`);
};

/**
 * Migrate candidates to ensure they have scores for jobs
 * and include frontend-compatible fields
 */
export const migrateCandidates = (): void => {
    const candidates = JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8')) as Candidate[];
    const jobs = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8')) as Job[];
    
    const migratedCandidates = candidates.map(candidate => {
        // Ensure scores array exists
        if (!candidate.scores) {
            candidate.scores = [];
        }
        
        // TypeScript now knows scores is defined
        const scores = candidate.scores;
        
        // For each job, ensure candidate has a score entry
        jobs.forEach(job => {
            const existingScore = scores.find(s => s.job_id === job.jobId);
            
            if (!existingScore) {
                // Calculate a mock score based on skills match
                const jobSkills = job.extracted_keywords.skills.map(s => s.toLowerCase());
                const candidateSkills = candidate.keywords.skills.map(s => s.toLowerCase());
                
                // Count matching skills (fuzzy match)
                const matchingSkills = candidateSkills.filter(skill => 
                    jobSkills.some(js => {
                        const jsLower = js.toLowerCase();
                        const skillLower = skill.toLowerCase();
                        return jsLower.includes(skillLower) || 
                               skillLower.includes(jsLower) ||
                               jsLower === skillLower;
                    })
                );
                
                // Base score on skill match, experience, and location
                let score = 50; // Base score
                score += matchingSkills.length * 10; // +10 per matching skill
                
                // Experience bonus - handle both field names
                const candidateExp = (candidate.keywords as any).min_experience_years || 
                                    (candidate.keywords as any).years_of_experience || 0;
                if (candidateExp >= job.extracted_keywords.min_experience_years) {
                    score += 15;
                } else if (candidateExp >= job.extracted_keywords.min_experience_years - 2) {
                    score += 5; // Partial match
                }
                
                // Location match bonus
                const candidateLoc = (candidate.keywords.location || '').toLowerCase();
                const jobLoc = (job.extracted_keywords.location || '').toLowerCase();
                if (candidateLoc === jobLoc ||
                    candidateLoc === 'remote' ||
                    jobLoc === 'remote') {
                    score += 10;
                }
                
                // Cap at 100
                score = Math.min(100, Math.max(0, score));
                
                // Create breakdown
                const breakdown = [
                    {
                        signal: "skill_match",
                        value: matchingSkills.length,
                        reason: matchingSkills.length > 0 
                            ? `Matched ${matchingSkills.length} skills: ${matchingSkills.slice(0, 3).join(', ')}`
                            : "No direct skill matches"
                    },
                    {
                        signal: "experience",
                        value: candidateExp,
                        reason: `${candidateExp} years of experience (required: ${job.extracted_keywords.min_experience_years})`
                    },
                    {
                        signal: "location",
                        value: candidateLoc === jobLoc || candidateLoc === 'remote' || jobLoc === 'remote' ? 1 : 0,
                        reason: `Location: ${candidate.keywords.location} vs ${job.extracted_keywords.location}`
                    }
                ];
                
                // Add score entry
                scores.push({
                    job_id: job.jobId,
                    score: score,
                    breakdown_json: breakdown,
                    outreach_messages: [
                        `Hi ${candidate.full_name.split(' ')[0]}, I noticed your experience with ${matchingSkills[0] || candidate.keywords.skills[0] || 'technology'} and thought you might be interested in our ${job.job_title} role at ${job.company_name || 'our company'}.`
                    ]
                });
            }
        });
        
        return candidate;
    });
    
    fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(migratedCandidates, null, 2), 'utf8');
    console.log(`✅ Migrated ${migratedCandidates.length} candidates`);
    console.log(`   Added scores for ${jobs.length} jobs per candidate`);
};

/**
 * Run full migration
 */
export const runMigration = (): void => {
    console.log('🔄 Starting mock data migration...\n');
    
    try {
        migrateJobs();
        migrateCandidates();
        
        console.log('\n✅ Migration completed successfully!');
        console.log('   Backend data is now compatible with frontend expectations.');
    } catch (error: any) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runMigration();
}
