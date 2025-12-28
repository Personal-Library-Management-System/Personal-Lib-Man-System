import { initializeApp } from './config/appConfig';
import { connectToDB } from './config/database';
import { loadEnvironmentVariables } from './config/environment';
import setupRoutes from './routes/setupRoutes';
import { setupSwagger } from './config/swagger';
import { setupExternalApiProxies } from './config/externalApi';

const PORT = process.env.PORT || 5000;

const setup = async (): Promise<void> => {
    loadEnvironmentVariables();
    await connectToDB();
    const app = initializeApp();
    setupSwagger(app);
    setupRoutes(app);
    setupExternalApiProxies(app);
    app.listen(PORT, () => {
        console.log(`Server started listening on ${PORT}`);
    });
};
setup();
