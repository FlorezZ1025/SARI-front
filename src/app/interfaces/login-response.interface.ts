import { User } from "./user.interface";

export interface LoginResponse {
    message?: string;
    user?: User;
    statusCode?: number;
}