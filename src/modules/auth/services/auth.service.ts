import { generateOTP } from '../../../utils/otp';
import { comparePassword, hashPassword } from '../../../utils/bcrypt';
import redisClient from '../../../config/redis';
import jwt from 'jsonwebtoken';
import type { IApiResponse, ICreateUserDto, ILoginDto, ISignupDto } from '../interfaces/auth.interface';
import { PrismaClient, Role } from "@prisma/client";
import { AuthRepository } from '../repositories/auth.repository';
import { userInfo } from 'node:os';
import { generateAccessToken, generateRefreshToken, generateResetToken } from '../../../utils/jwtToken';




export class AuthService {

    private authRepo = new AuthRepository();

    registerUser = async (userInfo: ISignupDto, role: string): Promise<IApiResponse> => {
        try {
            const existUser =
                await this.authRepo.findUserByEmail(
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
                await this.authRepo.createUser(
                    createUserDto,
                    role
                );

            return {
                status: "Success",
                statusCode: 201,
                message: "Account created successfully.",
                data: createdUser,
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

            const existUser =
                await this.authRepo.findUserByEmail(
                    loginInfo.email
                );

            if (!existUser) {

                return {
                    status: "Error",
                    statusCode: 400,
                    message: "User not found"
                };

            }

            const isValidPassword =
                await comparePassword(
                    loginInfo.password,
                    existUser.passwordHash
                );

            if (!isValidPassword) {

                return {
                    status: "Error",
                    statusCode: 401,
                    message: "Invalid Credentials"
                };

            }
            const hasRole =
                existUser.userRoles.some(
                    ur => ur.role.role === role
                );

            if (!hasRole && role !== "ADMIN") {

                await this.authRepo.assignRole(
                    existUser.id,
                    role
                );

            }

            const accessToken =
                generateAccessToken({

                    userId:
                        existUser.id,

                    email:
                        existUser.email,

                    roles: [role]

                });

            const refreshToken =
                generateRefreshToken(
                    existUser.id,
                    loginInfo.rememberMe
                );

            const refreshExpiryDays =
                loginInfo.rememberMe === "on"
                    ? 30
                    : 7;

            await this.authRepo.saveRefreshToken(

                existUser.id,

                refreshToken,

                new Date(

                    Date.now() +

                    refreshExpiryDays *
                    24 *
                    60 *
                    60 *
                    1000

                )

            );

            return {

                status: "Success",

                statusCode:
                    hasRole
                        ? 200
                        : 201,

                message:
                    hasRole
                        ? "User logged in successfully"
                        : `${role} role assigned successfully`,

                data: {

                    accessToken,

                    refreshToken

                }

            };

        } catch (error: any) {

            throw new Error(
                error.message
            );

        }

    };



    refreshToken = async (refreshToken: string): Promise<IApiResponse> => {

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

            // console.log("Decoded Token :", decoded)

            // Find refereshtoken from db
            const tokenRecord =
                await this.authRepo.findRefreshToken(
                    refreshToken
                );

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

            console.log("Testing Token expireies...........")
            console.log(tokenRecord.expiresAt.getTime(), Date.now())

            if (tokenRecord.expiresAt.getTime() < Date.now()) {
                return {
                    status: "Error",
                    statusCode: 401,
                    message:
                        "Refresh token expired"
                };
            }

            const user = await this.authRepo.findUserById(
                decoded.userId
            );

            // console.log(user)
            if (!user) {
                return {
                    status: "Error",
                    statusCode: 401,
                    message:
                        "User not found"
                };
            }

            console.log(decoded);
            const userRoles =
                user.userRoles.map(
                    ur => ur.role.role
                );

            console.log(user, user.userRoles)
            const accessToken: string = generateAccessToken({ userId: user.id, roles: userRoles, email: user.email });

            return {
                status: "Success",
                statusCode: 200,
                message:
                    "Access token generated",
                data: {
                    accessToken,
                    refreshToken
                }
            };

        } catch (error: any) {
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
        const existUser = await this.authRepo.findUserByEmail(email);

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
        await redisClient.setEx(`otp:${email}`, 2 * 60, otp);

        // generate JWT token
        const resetToken = generateResetToken({
            userId: existUser.id,
            email: existUser.email,
            otp: bcryptOTP,
        })

        const otpLink = 'http://localhost:8080/inbox'; // you can replace with real email link

        return {
            status: 'Success',
            statusCode: 200,
            message: 'OTP sent on Email',
            data: {
                otpLink,
                resetToken
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
            await redisClient.expire(attemptKey, 2 * 60); // 5-minute timeout window
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
        if (otp === systemOtp) {
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
            const hashedPassword =
                await hashPassword(password);
            console.log(hashPassword)

            const user = await this.authRepo.updatePasswordByEmail(
                email,
                hashedPassword
            );

            if (user) {
                return {
                    status: 'Success',
                    statusCode: 200,
                    message: `Password Updated Successfully`
                };
            }

            return {
                status: 'Error',
                statusCode: 401,
                message: `Password Updatation Failed`
            };


        } catch (e: any) {
            throw new Error(e.message)
        }
    }

}