import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

// Resolve paths relative to the compiled file's directory
const routesPath = path.join(__dirname, '../routes/*.js');

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PCN Vehicle Selling System API',
      version: '2.0.0',
      description: 'API documentation for Punchi Car Niwasa Vehicle Management System',
      contact: {
        name: 'PCN Support',
        email: 'sales@punchicar.lk',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: 'Development server',
      },
      {
        url: process.env.API_URL || 'https://api.punchicar.lk',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Vehicle: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            make: { type: 'string' },
            model: { type: 'string' },
            year: { type: 'integer' },
            price: { type: 'number' },
            mileage: { type: 'integer' },
            fuel_type: { type: 'string' },
            transmission: { type: 'string' },
            color: { type: 'string' },
            status: { type: 'string', enum: ['available', 'sold', 'reserved'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Sale: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            vehicle_id: { type: 'string', format: 'uuid' },
            customer_name: { type: 'string' },
            customer_phone: { type: 'string' },
            sale_price: { type: 'number' },
            status: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Vehicles', description: 'Vehicle management endpoints' },
      { name: 'Sales', description: 'Sales management endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Analytics', description: 'Analytics and reporting endpoints' },
      { name: 'Upload', description: 'File upload endpoints' },
    ],
  },
  apis: [routesPath],
};

export const swaggerSpec = swaggerJsdoc(options);
