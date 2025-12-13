import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import jobRoutes from './routes/jobRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import frontendJobRoutes from './routes/frontendJobRoutes.js';
import frontendCandidateRoutes from './routes/frontendCandidateRoutes.js';
import frontendAiRoutes from './routes/frontendAiRoutes.js';
import { RabbitMqService } from '../services/rabbitMqService.js';
import { getElasticsearchConfig } from '../config/elasticsearch.js';
import { ensureIndexExists, checkElasticsearchHealth } from '../services/elasticsearchService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load docs.yml from source directory (not dist) since TypeScript doesn't copy non-TS files
// __dirname in compiled code is dist/api, so go up to project root, then into src/docs
const projectRoot = path.resolve(__dirname, '../..');
const docsPath = path.join(projectRoot, 'src/docs/docs.yml');
const swaggerDocument = YAML.load(docsPath);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => res.send('🚀 StartupSignal API is operational. Visit /api-docs for documentation.'));

// Backend API routes (existing, for backward compatibility)
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);

// Frontend-compatible routes (matching frontend API paths)
app.use('/', frontendJobRoutes); // GET/POST /jd, GET/PUT /:jdId
app.use('/', frontendCandidateRoutes); // GET /:jdId/cd, POST /:jobId/cd/external-search, etc.
app.use('/', frontendAiRoutes); // POST /:jobId/cd/:candidateId/ai/*

const startServer = async () => {
    try {
      // 1. Initialize Elasticsearch if enabled
      const esConfig = getElasticsearchConfig();
      if (esConfig.enabled) {
        try {
          const isHealthy = await checkElasticsearchHealth();
          if (isHealthy) {
            await ensureIndexExists();
            console.log('✅ Elasticsearch initialized and index ready');
          } else {
            console.warn('⚠️  Elasticsearch is not healthy. Server will continue but Elasticsearch features may not work.');
            console.log('   Make sure Elasticsearch is running: docker-compose up -d');
          }
        } catch (esError: any) {
          console.warn('⚠️  Elasticsearch initialization failed:', esError.message);
          console.log('   Server will continue using JSON storage');
        }
      } else {
        console.log('📄 Using JSON file storage (Elasticsearch disabled)');
      }

      // 2. Try to initialize RabbitMQ (optional - server will start even if it fails)
      try {
        await RabbitMqService.init();
        console.log('✅ RabbitMQ initialized');
      } catch (rabbitError: any) {
        console.warn('⚠️  RabbitMQ initialization failed (optional):', rabbitError.message);
        console.log('   Server will continue without RabbitMQ');
      }
  
      // 3. Start Express
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📖 API Docs available at http://localhost:${PORT}/api-docs`);
        console.log(`🌐 Frontend API endpoints available at http://localhost:${PORT}/jd`);
      });
      
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
};

startServer();
// app.listen(PORT, () => {
//     console.log(`✅ API Server running on http://localhost:${PORT}`);
//     console.log(`📖 Docs available at http://localhost:${PORT}/api-docs`);
// });

export default app;

