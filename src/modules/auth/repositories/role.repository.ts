import { PrismaClient } from "@prisma/client";
import type { ICreateUser } from "../interfaces/auth.interface.js";

export class UserRepository{

    constructor(private readonly prisma: PrismaClient) {}

    async createProfile(data: ICreateUser): Promise<User> {
    return this.prisma.users.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
      },
    });
  }
}