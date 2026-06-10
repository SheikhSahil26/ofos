import { Router } from "express";

export interface IRoutes {
    path: string;
    router: Router;
}

declare global {
    namespace Express {
        interface payload {
            userId: string;
            role: string;
            email:string;
        }
    }
}