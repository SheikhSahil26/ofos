import { Prisma } from "@prisma/client";
import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import { PrismaClient } from "@prisma/client";

defineConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    url: env("DATABASE_URL"),
  },
});

<<<<<<< HEAD
const prisma = new Prisma();

=======
const prisma = new PrismaClient();

export { defineConfig, prisma };
>>>>>>> cc6a8e37edd34b5a1f5b4c9e5779c002f8b581cb
