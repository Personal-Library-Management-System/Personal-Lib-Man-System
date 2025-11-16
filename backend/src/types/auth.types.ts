export interface IGoogleUserPayload {
    sub: string;
    email: string;
    name: string;
    picture: string | null;
}

export interface JwtUserPayload {
    email: string;
    name?: string | null;
    picture?: string | null;
}
