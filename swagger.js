const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Revenue API',
      version: '1.0.0',
      description: 'A comprehensive API for managing shop revenue, accounts, moves, and history',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
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
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            type: { type: 'string', enum: ['admin', 'utilisateur'] },
            shop: { type: 'string' },
            shopId: { type: 'string' },
          },
        },
        Account: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            deposit: { type: 'number' },
            rate: { type: 'number' },
            type: { type: 'string', enum: ['primary', 'secondary'] },
            shop: { type: 'string' },
            shopId: { type: 'string' },
          },
        },
        Shop: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            address: { type: 'string' },
          },
        },
        Move: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            type: { type: 'string', enum: ['entrée', 'sortie'] },
            subType: { type: 'string', enum: ['vente', 'gain', 'dépense', 'versement', 'retrait'] },
            amount: { type: 'number' },
            account: { type: 'string' },
            accountId: { type: 'string' },
            user: { type: 'string' },
            userId: { type: 'string' },
            description: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
          },
        },
        History: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            moveSubType: { type: 'string' },
            amount: { type: 'number' },
            user: { type: 'string' },
            userId: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            status: { type: 'number' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './controllers/userController.js',
    './controllers/accountController.js',
    './controllers/shopController.js',
    './controllers/moveController.js',
    './controllers/historyController.js',
    './controllers/backupController.js',
  ],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
