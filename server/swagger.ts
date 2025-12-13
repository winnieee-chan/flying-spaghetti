import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Interview API',
      version: '1.0.0',
      description: 'API documentation for the Interview application',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        InterviewRequest: {
          type: 'object',
          properties: {
            jobTitle: {
              type: 'string',
              description: 'The job title for the interview',
              example: 'Software Engineer',
            },
            experienceLevel: {
              type: 'string',
              description: 'Experience level required',
              example: 'Mid-level',
            },
            skills: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of required skills',
              example: ['JavaScript', 'React', 'Node.js'],
            },
          },
        },
        InterviewResponse: {
          type: 'object',
          properties: {
            questionsRaw: {
              type: 'string',
              description: 'Raw interview questions generated',
            },
          },
        },
        Interview: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'Unique interview token',
            },
            questions: {
              type: 'array',
              items: {
                type: 'object',
              },
              description: 'List of interview questions',
            },
          },
        },
        SubmitResponse: {
          type: 'object',
          properties: {
            ok: {
              type: 'boolean',
              description: 'Submission status',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.ts', './index.ts'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };

