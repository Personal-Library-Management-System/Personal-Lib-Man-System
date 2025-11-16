import mongoose from 'mongoose';

export const connectToDB = async (): Promise<void> => {
    try {
        console.log('=== Connecting to the Database ===');
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            throw new Error('No connection string provided.');
        }
        await mongoose.connect(MONGODB_URI, {
            minPoolSize: 1,
            maxPoolSize: 10,
            connectTimeoutMS: 10000,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error : ', error);
        process.exit(1);
    }
};
