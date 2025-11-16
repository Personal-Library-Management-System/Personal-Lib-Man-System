import { initializeApp } from './config/appConfig';
import { connectToDB } from './config/database';
import { loadEnvironmentVariables } from './config/environment';

const PORT = 5000;

const setup = async (): Promise<void> => {
    loadEnvironmentVariables();
    await connectToDB();
    const app = initializeApp();
    app.listen(PORT, () => {
        console.log(`Server started listening on ${PORT}`);
    });
};
setup();
