import { PrismaClient } from "@prisma/client";
import { RestaurantController } from "../../restaurant/controlllers/restaurant.controller";
import { signupSchema } from "../validators/register.validator";
import { ICreateUserDto, ISignupDto } from "../interfaces/auth.interface";
import { use } from "passport";



export class UserRepository {
  constructor(private readonly prisma: PrismaClient) { }

  // Find user by email
  async findUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { userRoles: { include: { role: true } } }, // include roles if needed
      });

      console.log("User find by mail")
      console.log(user)
      return user;

    } catch (e: any) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  async getUserByEmailAndRole(email: string, role: string) {
    try {

      console.log("user")

      const user =  await this.prisma.user.findFirst({
        where: {
          email: email,
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
      console.log(user)

      return user
    } catch (e: any) {
      console.log(e.message);
    }
  }

  async createUser(userInfo: ICreateUserDto, role: string) {
    try {

      console.log(role)

      return await this.prisma.user.create({
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

  async assignRole(userId: string, role: string) {
    const roleData = await this.prisma.role.findUnique({
      where: {
        role: role
      }
    });

    if (!roleData) {
      throw new Error("Role not found");
    }

    return await this.prisma.userRole.create({
      data: {
        userId: userId,
        roleId: roleData.id
      }
    });

  }

  async saveRefreshToken(
    userId: string,
    refreshToken: string,
    expiresAt: Date
  ) {

    return await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt
      }
    });

  }

  async findRefreshToken(
    refreshToken: string
  ) {

    return await this.prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        isRevoked: false
      }
    });

  }
  async findUserById(
    userId: string
  ) {

    return await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    });

  }

  async revokeRefreshToken(
    refreshToken: string
) {

    return await this.prisma.refreshToken.updateMany({
        where: {
            token: refreshToken
        },
        data: {
            isRevoked: true
        }
    });

}
}