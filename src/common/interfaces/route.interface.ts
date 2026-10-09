import { Router } from "express";

export interface IRoutes {
    path: string;
    router: Router;
}

declare global {
    namespace Express {
        interface payload {
            userId: string;
            roles: string[];
            email: string;
        }
        interface otpPayload {
            userId: string;
            email: string;
            otp: string;
        }
    }
}
