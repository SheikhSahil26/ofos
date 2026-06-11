import { Payload } from "@prisma/client/runtime/library";
import jwt from "jsonwebtoken";
import { totalmem } from "node:os";

export const generateAccessToken = (
    payload: Express.payload
) => {

    return jwt.sign(payload,
        String(process.env.JWT_ACCESS_SECRET),
        {
            expiresIn: "15m"
        }
    );
};

export const generateRefreshToken = (
    userId:string, rememberMe: string
) => {

    return jwt.sign(
        {
            userId
        },
        String(process.env.JWT_REFRESH_SECRET),
        {
            expiresIn: rememberMe === "on" ? "7d" : "1d"
        }
    );
};

export const generateResetToken = (
    payload : Express.otpPayload
) => {

    return jwt.sign(
        payload,
        String(process.env.JWT_ACCESS_SECRET),
        {
            expiresIn: '2m'
        }
    );
};