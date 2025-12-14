/**
 * Test script for MCP Server
 * Tests MCP server tools and resources
 * 
 * Note: This is a basic test. For full MCP testing, use an MCP client.
 * Run with: npx tsx server/src/utils/testMcpServer.ts
 */

import dotenv from 'dotenv';
import { getElasticsearchConfig } from '../config/elasticsearch.js';
import { checkElasticsearchHealth } from '../services/elasticsearchService.js';
import { getElasticsearchClient } from '../services/elasticsearchService.js';
import db from '../db/db.js';

dotenv.config();

async function testMcpTools() {
    console.log(' Testing MCP Server Tools (Simulated)\n');

    const config = getElasticsearchConfig();
    
    if (!config.enabled) {
        console.log(' Elasticsearch is not enabled. MCP server requires Elasticsearch.');
        console.log('   Set USE_ELASTICSEARCH=true in .env\n');
        return;
    }

    // Check Elasticsearch health
    console.log('Test 1: Elasticsearch Health Check');
    const isHealthy = await checkElasticsearchHealth();
    if (!isHealthy) {
        console.log('   Result: Elasticsearch is not healthy');
        console.log('   MCP server requires a healthy Elasticsearch connection\n');
        return;
    }
    console.log('   Result: Healthy\n');

    // Test search_candidates tool (simulated)
    console.log('Test 2: search_candidates Tool');
    try {
        const results = await db.searchCandidates('Python', {
            minExperience: 3,
        });
        console.log(`   Query: "Python" with minExperience: 3`);
        console.log(`   Results: ${results.length} candidates`);
        console.log('   Result: Tool logic works\n');
    } catch (error: any) {
        console.log(`   Result: Error - ${error.message}\n`);
    }

    // Test get_candidate_by_id tool (simulated)
    console.log('Test 3: get_candidate_by_id Tool');
    try {
        const jobs = db.getAllJobs();
        if (jobs.length > 0) {
            const jobId = jobs[0].jobId;
            const candidates = await db.getCandidatesByJobId(jobId);
            if (candidates.length > 0) {
                const candidateId = candidates[0].candidateId;
                const candidate = await db.getCandidateById(candidateId);
                console.log(`   Candidate ID: ${candidateId}`);
                console.log(`   Found: ${candidate ? candidate.full_name : 'Not found'}`);
                console.log('   Result: Tool logic works\n');
            } else {
                console.log('   No candidates found, skipping\n');
            }
        } else {
            console.log('   No jobs found, skipping\n');
        }
    } catch (error: any) {
        console.log(`   Result: Error - ${error.message}\n`);
    }

    // Test get_candidates_for_job tool (simulated)
    console.log('Test 4: get_candidates_for_job Tool');
    try {
        const jobs = db.getAllJobs();
        if (jobs.length > 0) {
            const jobId = jobs[0].jobId;
            const candidates = await db.getCandidatesByJobId(jobId);
            console.log(`   Job ID: ${jobId}`);
            console.log(`   Candidates: ${candidates.length}`);
            if (candidates.length > 0) {
                const withMinScore = candidates.filter(c => c.score >= 60);
                console.log(`   With score >= 60: ${withMinScore.length}`);
            }
            console.log('   Result: Tool logic works\n');
        } else {
            console.log('   No jobs found, skipping\n');
        }
    } catch (error: any) {
        console.log(`   Result: Error - ${error.message}\n`);
    }

    console.log(' MCP Tool Tests Completed!\n');
    console.log(' Note: To test the actual MCP server, use an MCP client:');
    console.log('   npm run mcp:server | mcp-client');
    console.log('   Or connect via stdio transport\n');
}

testMcpTools().catch((error) => {
    console.error(' MCP test suite failed:', error);
    process.exit(1);
});
