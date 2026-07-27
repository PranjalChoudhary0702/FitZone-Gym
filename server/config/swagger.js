const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'FitZone Gym REST API Documentation',
    version: '1.0.0',
    description: 'Production-ready REST API endpoints for FitZone Gym (Users, Auth, Trainers, Membership Plans, Class Schedules, Bookings, and Contact Inquiries).'
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your signed JWT token obtained from /auth/verify-pin'
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: 'Server Health Check',
        responses: {
          '200': { description: 'API Server is healthy and running' }
        }
      }
    },
    '/auth/verify-pin': {
      post: {
        summary: 'Verify Admin PIN and issue JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['pin'],
                properties: {
                  pin: { type: 'string', example: '7788' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'PIN verified, returns JWT token' },
          '401': { description: 'Invalid Admin PIN' }
        }
      }
    },
    '/users': {
      get: {
        summary: 'Get all users with pagination and search',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Successful response' } }
      },
      post: {
        summary: 'Create a new user profile',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'phone'],
                properties: {
                  name: { type: 'string', example: 'Alex Morgan' },
                  email: { type: 'string', example: 'alex@example.com' },
                  phone: { type: 'string', example: '(555) 019-2834' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'User created' } }
      }
    },
    '/trainers': {
      get: {
        summary: 'Get all certified trainers',
        responses: { '200': { description: 'Successful response' } }
      },
      post: {
        summary: 'Create a new trainer (Requires JWT Bearer Token)',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Trainer created' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/plans': {
      get: {
        summary: 'Get all membership plans',
        responses: { '200': { description: 'Successful response' } }
      }
    },
    '/schedules': {
      get: {
        summary: 'Get class schedules filtered by day of week',
        parameters: [
          { name: 'day', in: 'query', schema: { type: 'string', example: 'mon' } }
        ],
        responses: { '200': { description: 'Successful response' } }
      }
    },
    '/bookings': {
      post: {
        summary: 'Create a free trial or class booking',
        responses: { '201': { description: 'Booking confirmed' } }
      }
    },
    '/contacts': {
      post: {
        summary: 'Submit a contact form inquiry',
        responses: { '201': { description: 'Inquiry received' } }
      }
    }
  }
};

module.exports = { swaggerUi, swaggerDocument };
