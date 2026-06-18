import { Request, Response, NextFunction } from "express";

export const authorizeRoles =(...roles: string[]) =>(req: Request,res: Response,next: NextFunction) => {

            const user = req.user as Express.payload;

            console.log('Is Authorize person')
            console.log(user)

            if (!user) {

                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            if (!roles.includes(user.role)) {

                return res.status(403).json({
                    success: false,
                    message: "Forbidden"
                });
            }

            next();
        };