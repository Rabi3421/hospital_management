export type Role = "user" | "admin" | "super_admin";

export interface JWTPayload {
    userId: string;
    email: string;
    role: Role;
    name: string;
    iat?: number;
    exp?: number;
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: Role;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface ApiError {
    message: string;
    status: number;
}
