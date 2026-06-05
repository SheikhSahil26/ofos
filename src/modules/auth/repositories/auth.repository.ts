import { PrismaClient } from "@prisma/client";
import type { ICreateUser } from "../interfaces/auth.interface.js";

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createProfile(data: ICreateUser) {
    return this.prisma.users.create({
      data: {
        full_name: data.fullName,
        email: data.email,
        mobile: data.phone,
        password_hash: data.passwordHash,
        updated_at: new Date(),
      },
    });
  }
}