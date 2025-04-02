import { User } from "./user.interface";

export interface LoginResponse {
    token?: string;
    message?: string;
    statusCode?: number;
}