// backend/src/services/health.service.ts

import mongoose from 'mongoose';

const checkDatabaseConnection = async (): Promise<boolean> => {
    // 1 = Bağlı, 2 = Bağlanıyor, 3 = Bağlantı kesiliyor, 0 = Bağlantı kesildi
    if (mongoose.connection.readyState === 1) {
        return true;
    }
    return false;
};

const healthService = {
    checkDatabaseConnection,
};

export default healthService;