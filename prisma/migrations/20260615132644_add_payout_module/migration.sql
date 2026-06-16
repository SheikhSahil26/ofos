/*
  Warnings:

  - You are about to drop the column `createdAt` on the `refresh_token` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `refresh_token` table. All the data in the column will be lost.
  - You are about to drop the column `isRevoked` on the `refresh_token` table. All the data in the column will be lost.
  - Added the required column `expires_at` to the `refresh_token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `refresh_token` DROP COLUMN `createdAt`,
    DROP COLUMN `expiresAt`,
    DROP COLUMN `isRevoked`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `expires_at` DATETIME(3) NOT NULL,
    ADD COLUMN `is_revoked` BOOLEAN NOT NULL DEFAULT false;
