import mongoose, { ConnectionStates } from 'mongoose';

const checkDatabaseConnection = (): boolean => {
    return mongoose.connection.readyState === ConnectionStates.connected;
};

const healthService = {
    checkDatabaseConnection,
};

export default healthService;
