import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
export const initializeApp = (): express.Application => {
    const CLIENT_URL = process.env.CLIENT_URL;
    if(!CLIENT_URL) {
        console.error("No Client URL is provided.");
        process.exit(1);
    }
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use(cors({
        origin: CLIENT_URL,
        credentials: true
    }));
    return app;
}
