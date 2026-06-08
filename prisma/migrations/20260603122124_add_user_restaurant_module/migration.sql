/*
  Warnings:

  - You are about to alter the column `mobile` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE `operating_hours` MODIFY `open_time` VARCHAR(10) NULL,
    MODIFY `close_time` VARCHAR(10) NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `full_name` VARCHAR(255) NOT NULL,
    MODIFY `email` VARCHAR(255) NOT NULL,
    MODIFY `mobile` VARCHAR(20) NOT NULL,
    MODIFY `password_hash` VARCHAR(255) NOT NULL,
    MODIFY `profile_photo` TEXT NULL;
