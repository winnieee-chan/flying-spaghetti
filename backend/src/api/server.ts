import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import jobRoutes from './routes/jobRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import { RabbitMqService } from '../services/rabbitMqService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = YAML.load(path.join(__dirname, '../docs/docs.yml'));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => res.send('🚀 StartupSignal API is operational. Visit /api-docs for documentation.'));

app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/candidates', candidateRoutes);

const startServer = async () => {
    try {
      // 1. Initialize RabbitMQ BEFORE starting the server
      await RabbitMqService.init();
  
      // 2. Start Express
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
      
    } catch (error) {
      console.error('Failed to start server:', error);
    }
};

startServer();
// app.listen(PORT, () => {
//     console.log(`✅ API Server running on http://localhost:${PORT}`);
//     console.log(`📖 Docs available at http://localhost:${PORT}/api-docs`);
// });

export default app;

