import { OAuth2Client } from 'google-auth-library';
import { IGoogleUserPayload } from '../types/auth.types';

const client = new OAuth2Client();

const verifyGoogleIdToken = async (
    idToken: string
): Promise<IGoogleUserPayload | null> => {
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
        return null;
    }
    return {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture ?? null,
    } as IGoogleUserPayload;
};

const authService = {
    verifyGoogleIdToken,
};
export default authService;
