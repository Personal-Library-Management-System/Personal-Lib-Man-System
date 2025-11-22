import mongoose from 'mongoose';

const CONNECTED = 1;

const checkDatabaseConnection = (): boolean => {
    return mongoose.connection.readyState === CONNECTED;
};

const healthService = {
    checkDatabaseConnection,
};

export default healthService;
