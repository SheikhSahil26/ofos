import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import { PrismaClient } from "@prisma/client";

 defineConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    url: env("DATABASE_URL"),
  },
});

// src/config/prisma.ts


const prisma = new PrismaClient();


export {defineConfig, prisma};
