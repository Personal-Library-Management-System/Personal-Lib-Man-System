export interface IGoogleUserPayload {
    sub: string;
    email: string;
    name: string;
    picture: string | null;
}

export interface JwtUserPayload {
    id: string;
    email: string;
    name?: string | null;
    picture?: string | null;
}
