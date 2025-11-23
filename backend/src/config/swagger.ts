import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import express from 'express';
import path from 'path';

const PORT = process.env.PORT || 5000;

const swaggerOptions: swaggerJSDoc.Options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'PLMS',
            description: 'Personal Library Management System',
            version: '1.0.0',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
    },
    apis: [path.join(__dirname, '..', 'routes', '*.routes.ts')],
    encoding: 'utf-8',
    failOnErrors: true,
    verbose: false,
};

export const setupSwagger = (app: express.Application) => {
    const swaggerSpec = swaggerJSDoc(swaggerOptions);
    app.use('/api/v1/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
};
