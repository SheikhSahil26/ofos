import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create Role
  const ownerRole = await prisma.role.upsert({
    where: {
      role: "RESTAURANT_OWNER",
    },
    update: {},
    create: {
      role: "RESTAURANT_OWNER",
    },
  });

  // Create Owner User
  const owner = await prisma.user.create({
    data: {
      fullName: "Restaurant Owner 1",
      email: "owner@test.com",
      mobile: "9999999999",
      passwordHash: await bcrypt.hash("Password@123", 10),
      isVerified: true,
    },
  });

  // Assign Role
  await prisma.userRole.create({
    data: {
      userId: owner.id,
      roleId: ownerRole.id,
    },
  });

  // Create Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      ownerId: owner.id,
      name: "Pizza Paradise",
      description: "Best Pizza in Town",
    },
  });

  // Create Branch
  const branch = await prisma.restaurantBranch.create({
    data: {
      restaurantId: restaurant.id,
      branchName: "Main Branch",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380015",
      contactNumber: "9999999999",
      verificationStatus: "APPROVED",
      isPrimary: true,
    },
  });

  console.log({
    ownerId: owner.id,
    restaurantId: restaurant.id,
    branchId: branch.id,
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });