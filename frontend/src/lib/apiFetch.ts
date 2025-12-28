import { jwtDecode } from 'jwt-decode';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL);

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
}

export function clearAccessToken() {
    accessToken = null;
}

async function refreshToken(): Promise<boolean> {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!res.ok) return false;
    try {
        const data = await res.json();
        if (data?.accessToken) {
            accessToken = data.accessToken;
            return true;
        }
    } catch {
        return false;
    }
    return false;
}

// added: ensure token validity before requests
type JwtPayload = { exp?: number };

async function ensureValidAccessToken(): Promise<boolean> {
    if (!accessToken) return await refreshToken();
    try {
        const { exp } = jwtDecode<JwtPayload>(accessToken);
        if (!exp) return true;
        const expiresAt = exp * 1000;
        const now = Date.now();
        const buffer = 30 * 1000; // renew if less than 30s left
        if (expiresAt - now <= buffer) {
            return await refreshToken();
        }
        return true;
    } catch {
        return await refreshToken();
    }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
    // ensure token is valid before request
    await ensureValidAccessToken();

    const opts: RequestInit = { ...options, credentials: 'include' };
    const headers = new Headers(opts.headers || {});
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    opts.headers = headers;

    let res = await fetch(`${BACKEND_URL}${path}`, opts);

    if (res.status === 401) {
        const refreshed = await refreshToken();
        if (!refreshed) {
            clearAccessToken();
            window.location.href = '/';
            return res;
        }
        // retry once with new token
        headers.set('Authorization', `Bearer ${accessToken}`);
        opts.headers = headers;
        res = await fetch(`${BACKEND_URL}${path}`, opts);

        if (res.status === 401) {
            clearAccessToken();
            window.location.href = '/';
            return res;
        }
    }
    return res;
}

export default apiFetch;
