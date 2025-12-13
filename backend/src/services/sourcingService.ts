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

    // Score candidates based on ALL keywords (role, skills, location, experience)
    const scoredCandidates = linkedInCandidates.map(candidate => {
        let totalScore = 0;
        const breakdown: any = {};

        // 1. Role Match (30 points)
        const candidateRole = (candidate.headline || '').toLowerCase();
        const requiredRole = role.toLowerCase();
        if (candidateRole.includes(requiredRole) || requiredRole.includes(candidateRole)) {
            breakdown.roleMatch = 30;
            totalScore += 30;
        } else {
            breakdown.roleMatch = 0;
        }

        // 2. Skills Match (40 points)
        const candidateSkills = candidate.skills || [];
        const matchedSkills = candidateSkills.filter((skill: string) =>
            requiredSkills.some(req =>
                skill.toLowerCase().includes(req.toLowerCase()) ||
                req.toLowerCase().includes(skill.toLowerCase())
            )
        );
        const skillScore = (matchedSkills.length / requiredSkills.length) * 40;
        breakdown.skillsMatch = Math.round(skillScore);
        breakdown.matchedSkills = matchedSkills;
        totalScore += skillScore;

        // 3. Location Match (15 points)
        const candidateLocation = (candidate.location || '').toLowerCase();
        const requiredLocation = location.toLowerCase();
        if (candidateLocation.includes(requiredLocation) || requiredLocation.includes(candidateLocation) || requiredLocation === 'remote') {
            breakdown.locationMatch = 15;
            totalScore += 15;
        } else {
            breakdown.locationMatch = 0;
        }

        // 4. Experience Match (15 points)
        const candidateYears = candidate.experience?.length || 0;
        const requiredYears = job.extracted_keywords.min_experience_years || 0;
        if (candidateYears >= requiredYears) {
            breakdown.experienceMatch = 15;
            totalScore += 15;
        } else if (requiredYears > 0) {
            const ratio = candidateYears / requiredYears;
            breakdown.experienceMatch = Math.round(ratio * 15);
            totalScore += ratio * 15;
        } else {
            breakdown.experienceMatch = 0;
        }

        return {
            ...candidate,
            score: Math.round(totalScore),
            scoreBreakdown: breakdown
        };
    });

    // Sort by score descending
    const sortedCandidates = scoredCandidates.sort((a, b) => b.score - a.score);

    console.log(`[Sourcing] Found ${sortedCandidates.length} candidates, top score: ${sortedCandidates[0]?.score || 0}`);
    return sortedCandidates;
};

/**
 * Search LinkedIn by keywords using Apify (no cookies required)
 * Uses harvestapi/linkedin-profile-search actor
 */
async function searchLinkedInByKeywords(role: string, skills: string[], location: string): Promise<any[]> {
    if (!process.env.APIFY_TOKEN) {
        console.warn('[LinkedIn] APIFY_TOKEN missing. Using mock data.');
        return generateMockCandidates(role, skills);
    }

    try {
        // Build search query focusing on skills
        // Include all skills for better matching
        const skillsQuery = skills.join(' OR ');
        const generalSearchQuery = `(${skillsQuery}) ${role}`;

        console.log(`[LinkedIn] Searching for candidates with skills: [${skills.join(', ')}]`);
        console.log(`[LinkedIn] Role: "${role}" | Location: "${location}"`);

        const input = {
            generalSearchQuery: generalSearchQuery, // Search for people with these skills
            currentJobTitles: [role], // Filter by current job title
            locations: [location], // Geographic filter
            maxItems: 1, // Limit results
            mode: 'short' // Fast, basic profile data
        };

        const run = await client.actor('harvestapi/linkedin-profile-search').call(input);

        if (run.status !== 'SUCCEEDED') {
            console.error(`[LinkedIn] Search failed with status: ${run.status}`);
            return generateMockCandidates(role, skills);
        }

        console.log(`💾 LinkedIn search results: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`);
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        console.log(items[0]);
        // Transform to only scoring-relevant fields
        return items.map((item: any) => ({
            id: item.publicIdentifier || randomUUID(),
            fullName: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
            headline: item.headline || '',
            location: item.location?.linkedinText || '',
            linkedInUrl: item.linkedinUrl || '',

            // Skills - extract names only (needed for tech match scoring)
            skills: item.skills?.map((s: any) => typeof s === 'string' ? s : s.name) || [],

            // Experience - for years of experience and startup scoring
            experience: item.experience?.map((exp: any) => ({
                position: exp.position,
                companyName: exp.companyName,
                duration: exp.duration,
                description: exp.description
            })) || [],

            // Education - optional for context
            education: item.education?.map((edu: any) => ({
                schoolName: edu.schoolName,
                degree: edu.degree,
                fieldOfStudy: edu.fieldOfStudy
            })) || []
        }));


    } catch (error) {
        console.error('[LinkedIn] Error searching:', error);
        return generateMockCandidates(role, skills);
    }
}

/**
 * Generate mock candidates for testing (when Apify is unavailable)
 */
function generateMockCandidates(role: string, skills: string[]): any[] {
    return [
        {
            id: randomUUID(),
            name: 'Alex Chen',
            headline: `Senior ${role}`,
            skills: [...skills.slice(0, 3), 'Git', 'Agile'],
            openToWork: true,
            github_username: 'alex-dev',
        },
        {
            id: randomUUID(),
            name: 'Jordan Smith',
            headline: `${role} Specialist`,
            skills: [...skills.slice(1, 4), 'Docker', 'CI/CD'],
            openToWork: false,
            github_username: 'j-smith',
        },
        {
            id: randomUUID(),
            name: 'Taylor Lee',
            headline: `Lead ${role}`,
            skills: skills,
            openToWork: true,
            github_username: 'taylor-codes',
        }
    ];
}

/**
 * Enrich candidates with GitHub data using Apify
 */
async function enrichWithGitHub(candidates: any[]): Promise<any[]> {
    if (!process.env.APIFY_TOKEN) {
        console.warn('[GitHub] APIFY_TOKEN missing. Using mock enrichment.');
        return addMockGitHubData(candidates);
    }

    // Extract GitHub profile URLs from candidates
    const githubLinks = candidates
        .map(c => c.github_username ? `https://github.com/${c.github_username}` : null)
        .filter(link => link !== null) as string[];

    if (githubLinks.length === 0) {
        console.warn('[GitHub] No GitHub usernames found in candidates. Using mock data.');
        return addMockGitHubData(candidates);
    }

    try {
        console.log(`[GitHub] Enriching ${githubLinks.length} profiles...`);

        const input = {
            repo_link: "",
            peoples_links: githubLinks
        };

        const run = await client.actor('saswave/github-profile-scraper').call(input);

        if (run.status !== 'SUCCEEDED') {
            console.error(`[GitHub] Scraper failed with status: ${run.status}`);
            return addMockGitHubData(candidates);
        }

        console.log(`💾 GitHub data available at: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`);
        const { items: githubData } = await client.dataset(run.defaultDatasetId).listItems();

        // Merge GitHub data with candidates
        return candidates.map(candidate => {
            const githubProfile = githubData.find((gh: any) =>
                gh.username === candidate.github_username ||
                gh.profileUrl?.includes(candidate.github_username)
            );

            return {
                ...candidate,
                candidateId: candidate.id || randomUUID(),
                enrichment: githubProfile ? {
                    public_repos: githubProfile.public_repos || 0,
                    total_stars: githubProfile.stars || githubProfile.total_stars || 0,
                    recent_activity_days: calculateRecentActivity(githubProfile),
                    updated_at: new Date().toISOString(),
                } : {
                    public_repos: 0,
                    total_stars: 0,
                    recent_activity_days: 365,
                    updated_at: new Date().toISOString(),
                }
            };
        });
    } catch (error) {
        console.error('[GitHub] Error enriching profiles:', error);
        return addMockGitHubData(candidates);
    }
}

/**
 * Add mock GitHub enrichment data for testing
 */
function addMockGitHubData(candidates: any[]): any[] {
    return candidates.map(candidate => ({
        ...candidate,
        candidateId: candidate.id || randomUUID(),
        enrichment: {
            public_repos: Math.floor(Math.random() * 50) + 5,
            total_stars: Math.floor(Math.random() * 1000),
            recent_activity_days: Math.floor(Math.random() * 30),
            updated_at: new Date().toISOString(),
        }
    }));
}

/**
 * Calculate days since last activity from GitHub profile
 */
function calculateRecentActivity(githubProfile: any): number {
    // If the profile has a last_commit_date or updated_at, calculate days
    if (githubProfile.last_commit_date) {
        const lastCommit = new Date(githubProfile.last_commit_date);
        const now = new Date();
        return Math.floor((now.getTime() - lastCommit.getTime()) / (1000 * 60 * 60 * 24));
    }
    // Default to 30 days if no data
    return 30;
}

/**
 * Score candidates based on relevance to job keywords
 */
function scoreCandidates(candidates: any[], job: Job): CandidateScore[] {
    const { skills: requiredSkills } = job.extracted_keywords;
    const { tech_match_weight, oss_activity_weight, startup_exp_weight } = job.scoring_ratios;

    return candidates.map(candidate => {
        // Calculate tech match score
        const candidateSkills = candidate.skills || [];
        const matchedSkills = candidateSkills.filter((skill: string) =>
            requiredSkills.some(req => skill.toLowerCase().includes(req.toLowerCase()))
        );
        const techScore = (matchedSkills.length / Math.max(requiredSkills.length, 1)) * 100;

        // Calculate OSS score
        const ossScore = Math.min((candidate.enrichment?.total_stars || 0) / 500, 1) * 100;

        // Calculate startup experience score (mock for now)
        const startupScore = Math.random() * 100;

        // Weighted final score
        const finalScore = Math.round(
            (tech_match_weight * techScore) +
            (oss_activity_weight * ossScore) +
            (startup_exp_weight * startupScore)
        );

        return {
            candidateId: candidate.candidateId,
            full_name: candidate.name || candidate.full_name || 'Unknown',
            headline: candidate.headline || candidate.title || '',
            github_username: candidate.github_username || '',
            open_to_work: candidate.openToWork || false,
            score: Math.max(0, Math.min(100, finalScore)),
            enrichment: candidate.enrichment,
            breakdown_json: [
                { signal: 'Tech Match', value: Math.round(techScore), reason: `Matched ${matchedSkills.length}/${requiredSkills.length} skills` },
                { signal: 'OSS Activity', value: Math.round(ossScore), reason: `${candidate.enrichment?.total_stars || 0} GitHub stars` },
                { signal: 'Startup Experience', value: Math.round(startupScore), reason: 'Based on work history' },
            ],
            outreach_messages: [
                `Hi ${candidate.name || candidate.full_name}, we're impressed by your ${matchedSkills.join(', ')} skills and think you'd be a great fit for our ${job.job_title} role.`
            ]
        };
    }).sort((a, b) => b.score - a.score); // Sort by score descending
}

/**
 * Generate mock candidates from profile URLs for testing
 */
function generateMockCandidatesFromUrls(profileUrls: string[]): any[] {
    const mockNames = ['Alex Chen', 'Jordan Smith', 'Taylor Lee', 'Sam Wilson', 'Morgan Davis'];

    return profileUrls.map((url, index) => ({
        id: randomUUID(),
        profileUrl: url,
        name: mockNames[index % mockNames.length],
        headline: `Software Engineer with ${2 + index} years experience`,
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Docker'].slice(0, 3 + index),
        openToWork: index % 2 === 0,
        github_username: `user-${index}`,
    }));
}
