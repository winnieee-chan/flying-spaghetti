// src/services/sourcingService.ts
import { ApifyClient } from 'apify-client';
import db from '../db/db.js';
import type { Job, CandidateScore } from '../types/index.js';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Apify Client
const client = new ApifyClient({
    token: process.env.APIFY_TOKEN
});

// Actor IDs
const LINKEDIN_ACTOR_ID = 'dev_fusion/linkedin-profile-scraper';

/**
 * Sources candidates from LinkedIn based on job keywords
 * @param job The job with keywords to search for
 * @returns Array of LinkedIn profiles with scores
 */
export const sourceCandidatesForJob = async (job: Job): Promise<any[]> => {
    console.log(`[Sourcing] Starting LinkedIn search for job: ${job.jobId}`);

    const { role, skills: requiredSkills, location } = job.extracted_keywords;

    // Search LinkedIn by keywords via Apify
    const linkedInCandidates = await searchLinkedInByKeywords(role, requiredSkills, location);

    // Transform candidates to match candidates.json structure
    const transformedCandidates = linkedInCandidates.map(candidate => {
        let totalScore = 0;
        const breakdown_json: any[] = [];

        // 1. Role Match (30 points)
        const candidateRole = (candidate.headline || '').toLowerCase();
        const requiredRole = role.toLowerCase();
        const roleMatch = candidateRole.includes(requiredRole) || requiredRole.includes(candidateRole);
        const roleScore = roleMatch ? 30 : 0;
        totalScore += roleScore;
        breakdown_json.push({
            signal: 'role_match',
            value: roleScore,
            reason: roleMatch ? `Role matches: ${candidate.headline}` : 'Role does not match'
        });

        // 2. Skills Match (40 points)
        const candidateSkills = candidate.skills || [];
        const matchedSkills = candidateSkills.filter((skill: string) =>
            requiredSkills.some(req =>
                skill.toLowerCase().includes(req.toLowerCase()) ||
                req.toLowerCase().includes(skill.toLowerCase())
            )
        );
        const skillScore = requiredSkills.length > 0
            ? (matchedSkills.length / requiredSkills.length) * 40
            : 0;
        totalScore += skillScore;
        breakdown_json.push({
            signal: 'skill_match',
            value: Math.round(skillScore),
            reason: matchedSkills.length > 0
                ? `Matched ${matchedSkills.length} skills: ${matchedSkills.join(', ')}`
                : 'No direct skill matches'
        });

        // 3. Location Match (15 points)
        const candidateLocation = (candidate.location || '').toLowerCase();
        const requiredLocation = location.toLowerCase();
        const locationMatch = candidateLocation.includes(requiredLocation) ||
            requiredLocation.includes(candidateLocation) ||
            requiredLocation === 'remote';
        const locationScore = locationMatch ? 15 : 0;
        totalScore += locationScore;
        breakdown_json.push({
            signal: 'location',
            value: locationScore,
            reason: `Location: ${candidate.location} vs ${location}`
        });

        // 4. Experience Match (15 points)
        const candidateYears = candidate.experience?.length || 0;
        const requiredYears = job.extracted_keywords.min_experience_years || 0;
        let experienceScore = 0;
        if (candidateYears >= requiredYears) {
            experienceScore = 15;
        } else if (requiredYears > 0) {
            experienceScore = (candidateYears / requiredYears) * 15;
        }
        totalScore += experienceScore;
        breakdown_json.push({
            signal: 'experience',
            value: Math.round(experienceScore),
            reason: `${candidateYears} years of experience (required: ${requiredYears})`
        });

        // Generate email from name if not provided by LinkedIn
        const fullName = candidate.fullName || 'Unknown User';
        const emailUsername = fullName.toLowerCase().replace(/\s+/g, '.');
        const generatedEmail = `${emailUsername}@example.com`;
        const email = candidate.email || generatedEmail; // Use real email if available

        // Create bio from headline and experience
        const experienceSummary = candidate.experience?.slice(0, 2)
            .map((exp: any) => `${exp.position} at ${exp.companyName}`)
            .join('. ') || '';
        const bio = `${candidate.headline || ''}. ${experienceSummary}`;

        // Generate outreach message
        const firstName = fullName.split(' ')[0];
        const outreachMessage = matchedSkills.length > 0
            ? `Hi ${firstName}, I noticed your experience with ${matchedSkills.slice(0, 3).join(', ')} and thought you might be interested in our ${job.job_title} role at ${job.company_name || 'our company'}.`
            : `Hi ${firstName}, I noticed your background and thought you might be interested in our ${job.job_title} role at ${job.company_name || 'our company'}.`;

        // Return candidates.json compatible structure
        return {
            _id: candidate.id || randomUUID(),
            full_name: fullName,
            email: email,
            bio: bio,
            github_username: candidate.github_username || '',
            open_to_work: true, // Default to true for sourced candidates
            keywords: {
                role: candidate.headline || role,
                skills: candidateSkills,
                years_of_experience: candidateYears,
                location: candidate.location
            },
            notificationSettings: [],
            mailbox: [], // For storing saved emails from /send and /sendall APIs
            scores: [
                {
                    job_id: job.jobId,
                    score: Math.round(totalScore),
                    breakdown_json: breakdown_json,
                    outreach_messages: [outreachMessage],
                    conversationHistory: [],
                    pipelineStage: 'sourced'
                }
            ]
        };
    });

    // Sort by score descending
    const sortedCandidates = transformedCandidates.sort((a, b) =>
        b.scores[0].score - a.scores[0].score
    );

    console.log(`[Sourcing] Found ${sortedCandidates.length} candidates, top score: ${sortedCandidates[0]?.scores[0]?.score || 0}`);
    return sortedCandidates;
};

/**
 * Search LinkedIn by keywords using Apify
 * Uses harvestapi/linkedin-profile-search (works on free plan)
 */
async function searchLinkedInByKeywords(role: string, skills: string[], location: string): Promise<any[]> {
    if (!process.env.APIFY_TOKEN) {
        console.warn('[LinkedIn] APIFY_TOKEN missing. Using mock data.');
        return generateMockCandidates(role, skills);
    }

    try {
        const skillsQuery = skills.join(' OR ');
        const generalSearchQuery = `(${skillsQuery}) ${role}`;

        console.log(`[LinkedIn] Searching for profiles...`);
        console.log(`[LinkedIn] Skills: [${skills.join(', ')}] | Role: "${role}" | Location: "${location}"`);

        const searchInput = {
            generalSearchQuery: generalSearchQuery,
            currentJobTitles: [role],
            locations: [location],
            maxItems: 10,
            mode: 'short'
        };

        const searchRun = await client.actor('harvestapi/linkedin-profile-search').call(searchInput);

        if (searchRun.status !== 'SUCCEEDED') {
            console.error(`[LinkedIn] Search failed with status: ${searchRun.status}`);
            return generateMockCandidates(role, skills);
        }

        console.log(`💾 Search results: https://console.apify.com/storage/datasets/${searchRun.defaultDatasetId}`);
        const { items: searchResults } = await client.dataset(searchRun.defaultDatasetId).listItems();

        if (!searchResults || searchResults.length === 0) {
            console.warn('[LinkedIn] No profiles found in search');
            return generateMockCandidates(role, skills);
        }

        console.log(`[LinkedIn] Found ${searchResults.length} profiles`);

        // Transform search results to our format
        return searchResults.map((item: any) => ({
            id: item.publicIdentifier || randomUUID(),
            fullName: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
            email: item.email || null, // Email rarely available in search results
            headline: item.headline || '',
            location: item.location?.linkedinText || item.location || '',
            linkedInUrl: item.linkedinUrl || item.url || '',

            // Skills
            skills: item.skills?.map((s: any) => typeof s === 'string' ? s : s.name) || [],

            // Experience
            experience: item.experience?.map((exp: any) => ({
                position: exp.position || exp.title,
                companyName: exp.companyName,
                duration: exp.duration,
                description: exp.description
            })) || [],

            // Education
            education: item.education?.map((edu: any) => ({
                schoolName: edu.schoolName,
                degree: edu.degree,
                fieldOfStudy: edu.fieldOfStudy
            })) || []
        }));

    } catch (error) {
        console.error('[LinkedIn] Error during search:', error);
        return generateMockCandidates(role, skills);
    }
}

/**
 * Generate mock candidates for testing (when Apify is unavailable)
 * Returns data in the same structure as LinkedIn API for consistency
 */
function generateMockCandidates(role: string, skills: string[]): any[] {
    return [
        {
            id: randomUUID(),
            fullName: 'Alex Chen',
            email: 'alex.chen@example.com',
            headline: `Senior ${role}`,
            location: 'Sydney, Australia',
            linkedInUrl: 'https://linkedin.com/in/alex-chen',
            skills: [...skills.slice(0, 3), 'Git', 'Agile'],
            experience: [
                {
                    position: `Senior ${role}`,
                    companyName: 'Tech Startup Inc',
                    duration: '2 yrs',
                    description: 'Leading development team'
                },
                {
                    position: role,
                    companyName: 'Digital Agency',
                    duration: '1 yr',
                    description: 'Building web applications'
                }
            ],
            education: [
                {
                    schoolName: 'University of Sydney',
                    degree: 'Bachelor of Computer Science',
                    fieldOfStudy: 'Software Engineering'
                }
            ],
            github_username: 'alex-dev'
        },
        {
            id: randomUUID(),
            fullName: 'Jordan Smith',
            email: 'jordan.smith@example.com',
            headline: `${role} Specialist`,
            location: 'Melbourne, Australia',
            linkedInUrl: 'https://linkedin.com/in/jordan-smith',
            skills: [...skills.slice(1, 4), 'Docker', 'CI/CD'],
            experience: [
                {
                    position: `${role} Specialist`,
                    companyName: 'Enterprise Corp',
                    duration: '3 yrs',
                    description: 'Specialized development work'
                }
            ],
            education: [
                {
                    schoolName: 'RMIT University',
                    degree: 'Bachelor of IT',
                    fieldOfStudy: 'Computer Science'
                }
            ],
            github_username: 'j-smith'
        },
        {
            id: randomUUID(),
            fullName: 'Taylor Lee',
            email: 'taylor.lee@example.com',
            headline: `Lead ${role}`,
            location: 'Brisbane, Australia',
            linkedInUrl: 'https://linkedin.com/in/taylor-lee',
            skills: skills,
            experience: [
                {
                    position: `Lead ${role}`,
                    companyName: 'Innovation Labs',
                    duration: '4 yrs',
                    description: 'Leading engineering teams'
                },
                {
                    position: `Senior ${role}`,
                    companyName: 'Software House',
                    duration: '2 yrs',
                    description: 'Full stack development'
                }
            ],
            education: [
                {
                    schoolName: 'Queensland University',
                    degree: 'Master of Software Engineering',
                    fieldOfStudy: 'Computer Science'
                }
            ],
            github_username: 'taylor-codes'
        }
    ];
}


