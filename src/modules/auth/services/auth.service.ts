import { generateOTP } from '../../../utils/otp';
import { comparePassword, hashPassword } from '../../../utils/bcrypt';
import redisClient from '../../../config/redis';
import jwt from 'jsonwebtoken';
import type { IApiResponse, ICreateUserDto, ILoginDto, ISignupDto } from '../interfaces/auth.interface';
import { PrismaClient, Role } from "@prisma/client";
import { UserRepository } from '../repositories/auth.repository';
import { userInfo } from 'node:os';

const prisma = new PrismaClient();
const userRepo = new UserRepository(prisma);

export class AuthService {

    // user-register Serivece............
    // registerUser = async (userInfo: ISignupDto, role: string): Promise<IApiResponse> => {
    //     try {

    //         // Check for User mail and Role is already exists or not

    //         let existUser = await userRepo.findUserByEmail(userInfo.email);

    //         if (existUser?.userRoles[0]?.role.role == role) {
    //             return {
    //                 status: 'Error',
    //                 message: "User Already Have Account with this role...",

    //             }
    //         }

    //         if (existUser) {
    //             return {
    //                 status: 'Error',
    //                 message: "User Already Have Account with this role..."
    //             }
    //         }

    //         const passwordHash = await hashPassword(userInfo.password)



    //         const createUserDto: ICreateUserDto = {
    //             fullName: userInfo.fullName,
    //             email: userInfo.email,
    //             mobile: userInfo.mobile,
    //             passwordHash
    //         };


    //         console.log("User not contain Account ")
    //         const createdUser =
    //             await userRepo.createUser(createUserDto, role);

    //         return {
    //             status: 'Success',
    //             message: 'User Created Successfullly..',
    //             data: createdUser
    //         }
    //     } catch (e: any) {
    //         throw new Error(e.message)
    //     }
    // }


    registerUser = async (
        userInfo: ISignupDto,
        role: string
    ): Promise<IApiResponse> => {

        try {

            const existUser =
                await userRepo.findUserByEmail(
                    userInfo.email
                );

            console.log("heloooo2222")
            console.log(existUser)
            // USER EXISTS
            if (existUser) {

                console.log("heloooo")
                console.log(existUser)

                const hasRole =
                    existUser.userRoles.some(
                        ur => ur.role.role === role
                    );

                // Same role already exists
                if (hasRole) {
                    return {
                        status: "Error",
                        message:
                            `${role} account already exists`
                    };
                }

                // User exists but role doesn't
                return {
                    status: "Success",
                    message:
                        "Account already exists. Please login to continue.",
                    data: {
                        requiresLogin: true,
                        email: userInfo.email,
                        redirectedUrl: `http://localhost:8080/api/auth/${role}/api/register`
                    }
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
                message:
                    "User created successfully",
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
                    message: "Invalid Credentials..."
                };
            }


            // Check role Already Assign or Not
            const hasRole =
                existUser.userRoles.some(
                    ur => ur.role.role === role
                );

            // Contains Role then logged that user
            if (hasRole) {
                return {
                    status: "Success",
                    message:
                        "User Logged in succesfully..",
                    data: existUser
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
                    message: `${role} role assigned successfully`,
                    data: existUser
                };

            }

        } catch (error: any) {

            throw new Error(error.message);

        }
    };



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
            otp: otp,
            roles: existUser.userRoles.map(ur => ur.role.role), // array of roles
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

        console.log(systemOtp);

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
        if (await comparePassword(otp, systemOtp)) {
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
            if (result && await comparePassword(password, result?.passwordHash)) {
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