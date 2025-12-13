/**
 * Migration script to move candidates from JSON to Elasticsearch
 * Run with: npx tsx server/src/utils/migrateToElasticsearch.ts
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getElasticsearchClient } from '../services/elasticsearchService.js';
import { ensureIndexExists, checkElasticsearchHealth } from '../services/elasticsearchService.js';
import { getElasticsearchConfig } from '../config/elasticsearch.js';
import type { Candidate } from '../types/index.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CANDIDATES_FILE = path.join(__dirname, '../data/candidates.json');

async function migrateCandidates() {
    console.log('🚀 Starting migration to Elasticsearch...\n');

    // Check if Elasticsearch is enabled
    const config = getElasticsearchConfig();
    if (!config.enabled) {
        console.error('❌ Elasticsearch is not enabled. Set USE_ELASTICSEARCH=true in .env');
        process.exit(1);
    }

    // Check Elasticsearch health
    console.log('📡 Checking Elasticsearch connection...');
    const isHealthy = await checkElasticsearchHealth();
    if (!isHealthy) {
        console.error('❌ Elasticsearch is not available. Make sure it\'s running.');
        console.log('💡 Start with: docker-compose up -d');
        process.exit(1);
    }
    console.log('✅ Elasticsearch is healthy\n');

    // Ensure index exists
    console.log('📋 Creating index if needed...');
    await ensureIndexExists();
    console.log('✅ Index ready\n');

    // Read candidates from JSON
    console.log('📖 Reading candidates from JSON file...');
    let candidates: Candidate[];
    try {
        const data = fs.readFileSync(CANDIDATES_FILE, 'utf8');
        candidates = JSON.parse(data);
        console.log(`✅ Found ${candidates.length} candidates\n`);
    } catch (error: any) {
        console.error('❌ Error reading candidates.json:', error.message);
        process.exit(1);
    }

    // Migrate candidates
    console.log('📦 Migrating candidates to Elasticsearch...');
    const client = getElasticsearchClient();
    const index = config.index;

    let successCount = 0;
    let errorCount = 0;
    const batchSize = 100;
    const operations: any[] = [];

    for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        
        // Remove _id from document body (Elasticsearch uses it as metadata)
        const { _id, ...candidateDoc } = candidate;
        
        operations.push({
            index: {
                _index: index,
                _id: _id,
            },
        });
        operations.push(candidateDoc);

        // Bulk index every batchSize candidates
                if (operations.length >= batchSize * 2 || i === candidates.length - 1) {
            try {
                const response = await client.bulk({ 
                    body: operations,
                    refresh: 'wait_for' // Wait for refresh to ensure documents are searchable
                });
                
                // Check for errors
                if (response.errors) {
                    response.items.forEach((item: any) => {
                        if (item.index?.error) {
                            console.error(`❌ Error indexing ${item.index._id}:`, item.index.error);
                            errorCount++;
                        } else {
                            successCount++;
                        }
                    });
                } else {
                    successCount += operations.length / 2;
                }

                operations.length = 0; // Clear array
                
                // Progress indicator
                const progress = ((i + 1) / candidates.length * 100).toFixed(1);
                process.stdout.write(`\r📊 Progress: ${progress}% (${i + 1}/${candidates.length})`);
            } catch (error: any) {
                console.error(`\n❌ Bulk operation failed:`, error.message);
                errorCount += operations.length / 2;
                operations.length = 0;
            }
        }
    }

    console.log('\n\n✅ Migration complete!');
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Total: ${candidates.length}\n`);

    // Verify migration
    console.log('🔍 Verifying migration...');
    // Force refresh before counting
    await client.indices.refresh({ index });
    const countResponse = await client.count({ index });
    console.log(`✅ Index contains ${countResponse.count} documents\n`);

    if (countResponse.count === candidates.length) {
        console.log('🎉 Migration verified successfully!');
    } else {
        console.warn(`⚠️  Warning: Expected ${candidates.length} documents, found ${countResponse.count}`);
    }
}

// Run migration
migrateCandidates().catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
});
