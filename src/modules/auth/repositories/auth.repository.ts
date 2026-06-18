import { PrismaClient } from "@prisma/client";
import { signupSchema } from "../validators/register.validator";
import { ICreateUserDto, ISignupDto } from "../interfaces/auth.interface";
import { use } from "passport";
import { prisma } from '../../../config/prisma'



export class AuthRepository {

  async createUser(userInfo: ICreateUserDto, role: string) {
    try {

      // console.log(role)

      return await prisma.user.create({
        data: {
          fullName: userInfo.fullName,
          email: userInfo.email,
          mobile: userInfo.mobile,
          passwordHash: userInfo.passwordHash,

          userRoles: {
            create: {
              role: {
                connect: {
                  role: role
                }
              }
            }
          }
        },
        include: {
          userRoles: {
            include: {
              role: true
            }
          }
        }
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  // Find user by ID
  async findUserById(
    userId: string
  ) {

    return await prisma.user.findUnique({
      where: {
        id: userId,
        isDeleted: false
      }
    });

  }

  // Find user by email
  async findUserByEmail(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email, isDeleted: false },
        include: { userRoles: { include: { role: true } } }, // include roles if needed
      });
      return user;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }


  async updatePasswordByEmail(email: string, hashedPassword: string) {
    try {
      const user =
        await prisma.user.update({
          where: {
            email
          },
          data: {
            passwordHash: hashedPassword
          }
        });

      return user;

    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async getUserByEmailAndRole(email: string, role: string) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
          isDeleted:false,
          userRoles: {
            some: {
              role: {
                role: role,
              },
            },
          },
        },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
      // console.log(user)
      return user
    } catch (e: any) {
      // console.log(e.message);
      throw new Error(e.message);
    }
  }


  async assignRole(userId: string, role: string) {
    const roleData = await prisma.role.findUnique({
      where: {
        role: role
      }
    });

    console.log("roleData: ", roleData);

    if (!roleData) {
      throw new Error("Role not found");
    }

    return await prisma.userRole.create({
      data: {
        userId: userId,
        roleId: roleData.id
      }
    });

  }


  // Tokens...
  async saveRefreshToken(
    userId: string,
    refreshToken: string,
    expiresAt: Date
  ) {

    return await prisma.refreshToken.create({
      data: {
        userId: userId,
        token: refreshToken,
        expiresAt
      }
    });

  }

  async findRefreshToken(refreshToken: string) {
    return await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        isRevoked: false
      }
    });

  }

  async revokeRefreshToken(refreshToken: string) {
    return await prisma.refreshToken.updateMany({
      where: {
        token: refreshToken
      },
      data: {
        isRevoked: true
      }
    });
  }
}