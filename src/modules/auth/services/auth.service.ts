import { generateOTP } from '../../../utils/otp';
import { comparePassword, hashPassword } from '../../../utils/bcrypt';
import redisClient from '../../../config/redis';
import jwt from 'jsonwebtoken';
import type { IApiResponse, ICreateUserDto, ILoginDto, ISignupDto } from '../interfaces/auth.interface';
import { PrismaClient, Role } from "@prisma/client";
import { UserRepository } from '../repositories/auth.repository';
import { userInfo } from 'node:os';
import { generateAccessToken, generateRefreshToken } from '../../../utils/jwtToken';

const prisma = new PrismaClient();
const userRepo = new UserRepository(prisma);

export class AuthService {

    registerUser = async (
        userInfo: ISignupDto,
        role: string
    ): Promise<IApiResponse> => {

        try {

            const existUser =
                await userRepo.findUserByEmail(
                    userInfo.email
                );

            // USER EXISTS
            if (existUser) {
                const hasRole =
                    existUser.userRoles.some(
                        ur => ur.role.role === role
                    );

                // Same role already exists
                if (hasRole) {
                    return {
                        status: "Error",
                        statusCode: 409,
                        message: `User is already registered as ${role}.`
                    };
                }

                // User exists but role doesn't
                return {
                    status: "Success",
                    statusCode: 200,
                    message: `Account already exists. Login to continue as ${role}.`,
                    data: {
                        requiresLogin: true,
                        email: userInfo.email
                    },
                    redirectURL: `/api/auth/${role}/static/login`
                };
            }

            // NEW USER
            const passwordHash =
                await hashPassword(
                    userInfo.password
                );

            const createUserDto: ICreateUserDto = {
                fullName: userInfo.fullName,
                email: userInfo.email,
                mobile: userInfo.mobile,
                passwordHash
            };

            const createdUser =
                await userRepo.createUser(
                    createUserDto,
                    role
                );

            return {
                status: "Success",
                statusCode: 201,
                message: "Account created successfully.",
                data: createdUser
            };

        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    loginUser = async (
        loginInfo: ILoginDto,
        role: string
    ): Promise<IApiResponse> => {

        try {

            // Here if user on ${role} cumplusory login if it contain email and password
            // possibilities : 1 user have email and password for this role - Give login to that user
            // possibilities : 2 user have email and password but not have role on this url than assign that role

            const existUser =
                await userRepo.findUserByEmail(
                    loginInfo.email
                );

            // Email exists or not...
            if (!existUser) {
                return {
                    status: "Error",
                    statusCode: 400,
                    message: "User not found"
                };
            }

            // verify Password
            const isValidPassword = await comparePassword(
                loginInfo.password,
                existUser.passwordHash
            );

            if (!isValidPassword) {
                return {
                    status: "Error",
                    statusCode: 401,
                    message: "Invalid Credentials..."
                };
            }


            const accessToken: string = generateAccessToken({ userId: existUser.id, role: role, email: existUser.email });
            const refreshToken: string = generateRefreshToken(existUser.id, loginInfo.rememberMe);

            await userRepo.saveRefreshToken(
                existUser.id,
                refreshToken,
                new Date(
                    Date.now() +
                    7 * 24 * 60 * 60 * 1000
                )
            );

            // Check role Already Assign or Not
            const hasRole =
                existUser.userRoles.some(
                    ur => ur.role.role === role
                );

            // Contains Role then logged that user
            if (hasRole) {
                return {
                    status: "Success",
                    statusCode: 200,
                    message:
                        "User Logged in succesfully..",
                    data: {
                        accessToken,
                        refreshToken
                    }
                };
            }
            // Not contain the role assign role and logged that user
            else {

                await userRepo.assignRole(
                    existUser.id,
                    role
                );


                return {
                    status: "Success",
                    statusCode: 201,
                    message: `${role} role assigned successfully`,
                    data: {
                        accessToken,
                        refreshToken
                    }
                };

            }

        } catch (error: any) {
            throw new Error(error.message);
        }
    };


    refreshToken = async (
        refreshToken: string
    ): Promise<IApiResponse> => {

        try {

            // Cookie not contains Referesh token
            if (!refreshToken) {
                return {
                    status: "Error",
                    statusCode: 401,
                    message: "Refresh token missing"
                };
            }

            // Decode Refresh tokens
            const decoded: any =
                jwt.verify(
                    refreshToken,
                    process.env.JWT_REFRESH_SECRET!
                );

            console.log("Decoded Token :", decoded)

            // Find refereshtoken from db
            const tokenRecord =
                await userRepo.findRefreshToken(
                    refreshToken
                );

            console.log(tokenRecord)
            // token inside databse might be revoked or not exists
            if (!tokenRecord) {

                return {
                    status: "Error",
                    statusCode: 401,
                    message:
                        "Refresh token revoked or not found"
                };
            }


            // still live that token 
            if (
                tokenRecord.expiresAt <
                new Date()
            ) {

                return {
                    status: "Error",
                    statusCode: 401,
                    message:
                        "Refresh token expired"
                };
            }

            const user =
                await userRepo.findUserById(
                    decoded.payload.userId
                );

            console.log(user)
            if (!user) {

                return {
                    status: "Error",
                    statusCode: 401,
                    message:
                        "User not found"
                };
            }

            const accessToken: string = generateAccessToken({ userId: user.id, role: decoded.role, email: decoded.email });
            return {
                status: "Success",
                statusCode: 200,
                message:
                    "Access token generated",
                data: {
                    accessToken
                }
            };

        } catch (error: any) {

            console.log(error.message, error)

            return {
                status: "Error",
                statusCode: 400,
                message:
                    "Invalid refresh token"
            };

        }
    };


    verifyUserByEmailForOtp = async (email: string): Promise<IApiResponse> => {
        // find user
        const existUser = await userRepo.findUserByEmail(email);

        if (!existUser) {
            return {
                status: 'Error',
                statusCode: 401,
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
            otp: otp,
            roles: existUser.userRoles.map(ur => ur.role.role), // array of roles
        };

        const token = jwt.sign(payload, String(process.env.SECRET), { expiresIn: '5m' });

        // const 

        const otpLink = 'http://localhost:8080/api/auth/static/inbox'; // you can replace with real email link

        return {
            status: 'Success',
            statusCode: 200,
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

        console.log(systemOtp);

        if (!systemOtp) {
            return {
                status: 'Error',
                statusCode: 429,
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
                statusCode: 410,
                message: "Too many failed attempts. OTP killed.",
            }
        }

        // Check if the user's submitted entry is correct
        if (await comparePassword(otp, systemOtp)) {
            await redisClient.del(otpKey); // Cleanup
            await redisClient.del(attemptKey);
            return {
                status: 'Success',
                statusCode: 200,
                message: "OTP verified! Welcome."
            }
        } else {
            const remaining = 3 - attempts;
            return {
                status: 'Error',
                statusCode: 400,
                message: `Incorrect code. ${remaining} tries left.`
            };
        }

    }
    updateUserPasswordService = async (email: string, password: string): Promise<IApiResponse> => {

        try {
            const result = await userRepo.findUserByEmail(email)
            if (result && await comparePassword(password, result?.passwordHash)) {
                return {
                    status: 'Success',
                    statusCode: 200,
                    message: 'Password Updated Successfully..',
                }
            } else {
                return {
                    status: 'Error',
                    statusCode: 400,
                    message: 'Password not Updated Successfully..',
                }
            }

        } catch (e: any) {
            throw new Error(e.message)
        }
    }

}