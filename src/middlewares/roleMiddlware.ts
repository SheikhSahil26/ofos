import { Request, Response, NextFunction } from "express";
export const authorizeRoles =
    (...allowedRoles: string[]) =>
        (
            req: Request,
            res: Response,
            next: NextFunction
        ) => {

            const user =
                req.user as Express.payload;

            if (!user) {

                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });

            }

            const hasRole =
                user.roles.some(
                    role =>
                        allowedRoles.includes(role)
                );

            if (!hasRole) {

                return res.status(403).json({
                    success: false,
                    message: "Forbidden"
                });

            }

            next();
        };