/**
 * Test script for Elasticsearch integration
 * Run with: npx tsx server/src/utils/testElasticsearch.ts
 */

import dotenv from 'dotenv';
import { getElasticsearchConfig } from '../config/elasticsearch.js';
import { checkElasticsearchHealth, ensureIndexExists } from '../services/elasticsearchService.js';
import db from '../db/db.js';

dotenv.config();

async function runTests() {
    console.log('🧪 Testing Elasticsearch Integration\n');

    const config = getElasticsearchConfig();
    
    if (!config.enabled) {
        console.log('⚠️  Elasticsearch is not enabled. Set USE_ELASTICSEARCH=true');
        console.log('   Testing with JSON fallback...\n');
    } else {
        console.log('✅ Elasticsearch is enabled\n');
    }

    // Test 1: Health check
    console.log('Test 1: Elasticsearch Health Check');
    if (config.enabled) {
        const isHealthy = await checkElasticsearchHealth();
        console.log(`   Result: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}\n`);
    } else {
        console.log('   Skipped (Elasticsearch disabled)\n');
    }

    // Test 2: Get candidates for a job
    console.log('Test 2: Get Candidates for Job');
    try {
        const jobs = db.getAllJobs();
        if (jobs.length > 0) {
            const jobId = jobs[0].jobId;
            const candidates = await db.getCandidatesByJobId(jobId);
            console.log(`   Job ID: ${jobId}`);
            console.log(`   Candidates found: ${candidates.length}`);
            console.log(`   Result: ✅ Success\n`);
        } else {
            console.log('   No jobs found, skipping\n');
        }
    } catch (error: any) {
        console.log(`   Result: ❌ Error - ${error.message}\n`);
    }

    // Test 3: Get candidate by ID
    console.log('Test 3: Get Candidate by ID');
    try {
        const jobs = db.getAllJobs();
        if (jobs.length > 0) {
            const jobId = jobs[0].jobId;
            const candidates = await db.getCandidatesByJobId(jobId);
            if (candidates.length > 0) {
                const candidateId = candidates[0].candidateId;
                const candidate = await db.getCandidateById(candidateId);
                console.log(`   Candidate ID: ${candidateId}`);
                console.log(`   Name: ${candidate?.full_name || 'Not found'}`);
                console.log(`   Result: ${candidate ? '✅ Success' : '❌ Not found'}\n`);
            } else {
                console.log('   No candidates found, skipping\n');
            }
        } else {
            console.log('   No jobs found, skipping\n');
        }
    } catch (error: any) {
        console.log(`   Result: ❌ Error - ${error.message}\n`);
    }

    // Test 4: Search candidates
    console.log('Test 4: Search Candidates');
    try {
        const results = await db.searchCandidates('Python', {
            minExperience: 3,
        });
        console.log(`   Query: "Python" with minExperience: 3`);
        console.log(`   Results: ${results.length} candidates`);
        if (results.length > 0) {
            console.log(`   First result: ${results[0].full_name}`);
        }
        console.log(`   Result: ✅ Success\n`);
    } catch (error: any) {
        console.log(`   Result: ❌ Error - ${error.message}\n`);
    }

    // Test 5: Search with filters
    console.log('Test 5: Search with Multiple Filters');
    try {
        const results = await db.searchCandidates('', {
            skills: ['Python', 'FastAPI'],
            location: 'Sydney',
            openToWork: true,
        });
        console.log(`   Filters: skills=[Python, FastAPI], location=Sydney, openToWork=true`);
        console.log(`   Results: ${results.length} candidates`);
        console.log(`   Result: ✅ Success\n`);
    } catch (error: any) {
        console.log(`   Result: ❌ Error - ${error.message}\n`);
    }

    // Test 6: Update pipeline stage
    console.log('Test 6: Update Pipeline Stage');
    try {
        const jobs = db.getAllJobs();
        if (jobs.length > 0) {
            const jobId = jobs[0].jobId;
            const candidates = await db.getCandidatesByJobId(jobId);
            if (candidates.length > 0) {
                const candidateId = candidates[0].candidateId;
                const success = await db.updateCandidatePipelineStage(candidateId, jobId, 'engaged');
                console.log(`   Candidate ID: ${candidateId}`);
                console.log(`   Stage: engaged`);
                console.log(`   Result: ${success ? '✅ Success' : '❌ Failed'}\n`);
            } else {
                console.log('   No candidates found, skipping\n');
            }
        } else {
            console.log('   No jobs found, skipping\n');
        }
    } catch (error: any) {
        console.log(`   Result: ❌ Error - ${error.message}\n`);
    }

    // Test 7: Get candidate score for job
    console.log('Test 7: Get Candidate Score for Job');
    try {
        const jobs = db.getAllJobs();
        if (jobs.length > 0) {
            const jobId = jobs[0].jobId;
            const candidates = await db.getCandidatesByJobId(jobId);
            if (candidates.length > 0) {
                const candidateId = candidates[0].candidateId;
                const score = await db.getCandidateScoreForJob(candidateId, jobId);
                console.log(`   Candidate ID: ${candidateId}`);
                console.log(`   Score: ${score?.score || 'N/A'}`);
                console.log(`   Result: ${score ? '✅ Success' : '❌ Not found'}\n`);
            } else {
                console.log('   No candidates found, skipping\n');
            }
        } else {
            console.log('   No jobs found, skipping\n');
        }
    } catch (error: any) {
        console.log(`   Result: ❌ Error - ${error.message}\n`);
    }

    console.log('✅ All tests completed!\n');
}

runTests().catch((error) => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
});
