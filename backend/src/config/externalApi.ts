import express, { Request, Response } from 'express';
import { API_BASE } from '../routes/setupRoutes';
import authMiddleware from '../middleware/auth.middleware';
import { createProxyMiddleware, fixRequestBody, Options } from 'http-proxy-middleware';

const commonProxyConfig: Options = {
    changeOrigin: true,
    proxyTimeout: 10000,
    on: {
        proxyReq(proxyReq, req) {
            fixRequestBody(proxyReq, req);
        },
        error(err, req, res) {
            const expressRes = res as Response;
            console.error('Proxy Error encountered:', err.message);
            if (!expressRes.headersSent) {
                expressRes.status(502).json({
                    error: 'Bad Gateway',
                    message: 'The requested external service is currently unavailable.',
                });
            }
        },
        proxyRes(proxyRes, req, res) {
            delete proxyRes.headers['x-powered-by'];
            delete proxyRes.headers['server'];
            delete proxyRes.headers['access-control-allow-origin'];
            delete proxyRes.headers['access-control-allow-credentials'];
            delete proxyRes.headers['vary'];

            res.setHeader(
                'Access-Control-Allow-Origin',
                process.env.CLIENT_URL!
            );
            res.setHeader(
                'Access-Control-Allow-Credentials',
                'true'
            );
        },
    },
};

const googleBooksProxy = createProxyMiddleware({
    ...commonProxyConfig,
    target: 'https://www.googleapis.com',
    pathRewrite: {
        '^/': '/books/v1/volumes',
    },
    on: {
        ...commonProxyConfig.on,
        proxyReq(proxyReq, req) {
            const apiKey = process.env.GOOGLE_BOOKS_API_KEY!;
            const url = new URL(proxyReq.path, 'https://www.googleapis.com');
            url.searchParams.set('key', apiKey);
            proxyReq.path = url.pathname + url.search;
        },
    },
});

const omdbProxy = createProxyMiddleware({
    ...commonProxyConfig,
    target: 'https://www.omdbapi.com',
    pathRewrite: { '^/': '/' },
    on: {
        ...commonProxyConfig.on,
        proxyReq(proxyReq, req) {
            fixRequestBody(proxyReq, req);
            const apiKey = process.env.OMDB_API_KEY!;
            const url = new URL(proxyReq.path, 'https://www.omdbapi.com');
            url.searchParams.set('apikey', apiKey);
            proxyReq.path = url.pathname + url.search;
        },
    },
});

const geminiProxy = createProxyMiddleware({
    ...commonProxyConfig,
    target: 'https://generativelanguage.googleapis.com',
    pathRewrite: {
        [`^${API_BASE}/gemini`]: '/v1/models',
    },
    on: {
        ...commonProxyConfig.on,
        proxyReq(proxyReq, req) {
            fixRequestBody(proxyReq, req);
            const apiKey = process.env.GEMINI_API_KEY!;
            const url = new URL(proxyReq.path, 'https://generativelanguage.googleapis.com');
            url.searchParams.set('key', apiKey);
            proxyReq.path = url.pathname + url.search;
        },
    },
});

export const setupExternalApiProxies = (app: express.Application) => {
    app.use(`${API_BASE}/google-books`, authMiddleware, googleBooksProxy);
    app.use(`${API_BASE}/omdb`, authMiddleware, omdbProxy);
    app.use(`${API_BASE}/gemini`, authMiddleware, geminiProxy);
};
