import dotenv from 'dotenv';
import path from 'path';

export const loadEnvironmentVariables = () => {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (!isDevelopment) { return; }

    console.log('=== Loading Environment Variables ===');
    const configOutput = dotenv.config({
        path: path.resolve(__dirname, '.env'),
        encoding: 'utf-8',
        debug: true,
        override: true,
    });
    if (configOutput.error) {
        console.error('Environment variable load failed : ', configOutput.error);
        process.exit(1);
    }
};
