"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUiOptions = exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'DevFlow API Documentation',
        version: '1.0.0',
        description: 'Comprehensive GitHub Project Dashboard API - Manage issues, repositories, and projects across multiple GitHub repos',
        contact: {
            name: 'DevFlow Team',
            email: 'support@devflow.com',
        },
        license: {
            name: 'ISC',
            url: 'https://opensource.org/licenses/ISC',
        },
    },
    servers: [
        {
            url: 'http://localhost:5000',
            description: 'Development server',
        },
        {
            url: 'https://api.devflow.com',
            description: 'Production server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter your JWT token',
            },
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: false,
                    },
                    message: {
                        type: 'string',
                        example: 'Error message',
                    },
                    error: {
                        type: 'string',
                        example: 'Detailed error information',
                    },
                },
            },
            User: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: 'ckl1234567890',
                    },
                    email: {
                        type: 'string',
                        example: 'john@example.com',
                    },
                    name: {
                        type: 'string',
                        example: 'John Doe',
                    },
                    avatar: {
                        type: 'string',
                        example: 'https://avatars.githubusercontent.com/u/12345',
                    },
                    githubLogin: {
                        type: 'string',
                        example: 'johndoe',
                    },
                    githubId: {
                        type: 'integer',
                        example: 12345678,
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2026-02-13T10:00:00Z',
                    },
                },
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
    tags: [
        {
            name: 'Authentication',
            description: 'GitHub OAuth and JWT authentication endpoints',
        },
        {
            name: 'Repositories',
            description: 'Repository management endpoints',
        },
        {
            name: 'Issues',
            description: 'Issue management endpoints',
        },
        {
            name: 'Labels',
            description: 'Label management endpoints',
        },
        {
            name: 'Comments',
            description: 'Comment management endpoints',
        },
        {
            name: 'Categories',
            description: 'Custom category management endpoints',
        },
        {
            name: 'Filters',
            description: 'Filter and view management endpoints',
        },
        {
            name: 'Analytics',
            description: 'Analytics and insights endpoints',
        },
        {
            name: 'Notifications',
            description: 'Notification management endpoints',
        },
        {
            name: 'Health',
            description: 'System health check endpoints',
        },
    ],
};
const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API routes
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'DevFlow API Docs',
};
