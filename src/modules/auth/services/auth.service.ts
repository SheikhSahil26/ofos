import { generateOTP } from '../../../utils/otp';
import { comparePassword, hashPassword } from '../../../utils/bcrypt';
import redisClient from '../../../config/redis';
import jwt from 'jsonwebtoken';
import type { IApiResponse } from '../interfaces/auth.interface';
import { PrismaClient } from "@prisma/client";
import { UserRepository } from '../repositories/auth.repository';

const prisma = new PrismaClient();
const userRepo = new UserRepository(prisma);

export class AuthService {

    verifyUserByEmail = async (email: string): Promise<IApiResponse> => {
        // find user
        const existUser = await userRepo.findUserByEmail(email);

        if (!existUser) {
            return {
                status: 'Error',
                message: "Email does not exist"
            };
        }

        // generate OTP and hash it
        const otp = generateOTP();
        const bcryptOTP = await hashPassword(otp);

        // store OTP in Redis for 5 minutes
        await redisClient.setEx(`otp:${email}`, 5 * 60, bcryptOTP);

        // generate JWT token
        const payload = {
            user_id: existUser.id,
            email: existUser.email,
            otp:otp,
            roles: existUser.user_roles.map(ur => ur.roles.role), // array of roles
        };

        const token = jwt.sign(payload, String(process.env.SECRET), { expiresIn: '5m' });

        const otpLink = 'http://localhost:8080/api/auth/static/inbox'; // you can replace with real email link

        return {
            status: 'Success',
            message: 'OTP sent to registered email',
            data: {
                otpLink,
                token
            }
        };
    };

    verifyOTPService = async (otp: string, email: string): Promise<IApiResponse> => {

        console.log(redisClient);

        const otpKey = `otp:${email}`;
        const attemptKey = `attempts:${email}`;

        const systemOtp = await redisClient.get(otpKey);

        if (!systemOtp) {
            return {
                status: 'Error',
                message: "OTP expired or never requested.",
            }
        }

        // Increment the counter right here. This kills the loop instantly!
        const attempts = await redisClient.incr(attemptKey);
        if (attempts === 1) {
            await redisClient.expire(attemptKey, 5 * 60); // 5-minute timeout window
        }

        // Check if the loop script has breached the safety limit
        if (attempts > 3) {
            await redisClient.del(otpKey); // Max-3 Attemp Allow
            await redisClient.del(attemptKey); // Remove attemps
            return {
                status: 'Error',
                message: "Too many failed attempts. OTP killed.",
            }
        }

        // Check if the user's submitted entry is correct
        if (otp === systemOtp) {
            await redisClient.del(otpKey); // Cleanup
            await redisClient.del(attemptKey);
            return {
                status: 'Success',
                message: "OTP verified! Welcome."
            }
        } else {
            const remaining = 3 - attempts;
            return { status: 'Error', message: `Incorrect code. ${remaining} tries left.` };
        }

    }
    updateUserPasswordService = async (email: string, password: string): Promise<IApiResponse> => {

        try {
            const result = await userRepo.findUserByEmail(email)
            if (result && await comparePassword(password, result?.password_hash)) {
                return {
                    status: 'Success',
                    message: 'Password Updated Successfully..',
                }
            } else {
                return {
                    status: 'Error',
                    message: 'Password not Updated Successfully..',
                }
            }

        } catch (e: any) {
            throw new Error(e.message)
        }
    }

}