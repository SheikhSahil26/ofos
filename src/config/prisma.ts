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

const prisma = new PrismaClient();

export { defineConfig, prisma };
=======
>>>>>>> feature/forget-password
