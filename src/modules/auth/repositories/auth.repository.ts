import { PrismaClient } from "@prisma/client";
import type { ICreateUser } from "../interfaces/auth.interface.js";

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) { }

  // Create user
  // async createProfile(data: ICreateUser) {
  //   return this.prisma.users.create({
  //     data: {
  //       id:full_name: data.fullName,
  //       email: data.email,
  //       mobile: data.phone,
  //       password_hash: data.passwordHash,
  //       updated_at: new Date(),
  //     },
  //   });
  // }

  // Find user by email
  async findUserByEmail(email: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
      include: { user_roles: { include: { roles: true } } }, // include roles if needed
    });
    return user;
  }

}