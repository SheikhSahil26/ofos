/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `restaurant_promotions` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `restaurant_promotions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[restaurant_id,code]` on the table `restaurant_promotions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `users_mobile_key` ON `users`;

-- AlterTable
ALTER TABLE `restaurant_promotions` DROP COLUMN `deleted_at`,
    DROP COLUMN `is_deleted`,
    ADD COLUMN `code` VARCHAR(50) NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `maximum_discount_amount` DECIMAL(10, 2) NULL,
    ADD COLUMN `minimum_order_amount` DECIMAL(10, 2) NULL,
    MODIFY `discount_value` DECIMAL(10, 2) NULL;

-- CreateTable
CREATE TABLE `promotion_menu_items` (
    `id` VARCHAR(191) NOT NULL,
    `promotion_id` VARCHAR(191) NOT NULL,
    `menu_item_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `promotion_menu_items_promotion_id_menu_item_id_key`(`promotion_id`, `menu_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payout_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `gross_amount` DECIMAL(10, 2) NOT NULL,
    `branch_amount` DECIMAL(10, 2) NOT NULL,
    `delivery_amount` DECIMAL(10, 2) NOT NULL,
    `platform_fee` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('COMPLETED') NOT NULL DEFAULT 'COMPLETED',
    `processed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payout_transactions_order_id_key`(`order_id`),
    INDEX `payout_transactions_order_id_idx`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restaurant_payouts` (
    `id` VARCHAR(191) NOT NULL,
    `payout_transaction_id` VARCHAR(191) NOT NULL,
    `branch_head_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `settlement_id` VARCHAR(191) NULL,
    `transferred_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `restaurant_payouts_branch_head_id_idx`(`branch_head_id`),
    INDEX `restaurant_payouts_status_idx`(`status`),
    INDEX `restaurant_payouts_settlement_id_idx`(`settlement_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_partner_payouts` (
    `id` VARCHAR(191) NOT NULL,
    `payout_transaction_id` VARCHAR(191) NOT NULL,
    `delivery_partner_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `settlement_id` VARCHAR(191) NULL,
    `transferred_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `delivery_partner_payouts_delivery_partner_id_idx`(`delivery_partner_id`),
    INDEX `delivery_partner_payouts_status_idx`(`status`),
    INDEX `delivery_partner_payouts_settlement_id_idx`(`settlement_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settlements` (
    `id` VARCHAR(191) NOT NULL,
    `settlement_type` ENUM('RESTAURANT', 'DELIVERY_PARTNER') NOT NULL,
    `beneficiary_id` VARCHAR(191) NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `payout_count` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `settled_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `settlements_beneficiary_id_idx`(`beneficiary_id`),
    INDEX `settlements_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `restaurant_promotions_restaurant_id_code_key` ON `restaurant_promotions`(`restaurant_id`, `code`);

-- AddForeignKey
ALTER TABLE `promotion_menu_items` ADD CONSTRAINT `promotion_menu_items_promotion_id_fkey` FOREIGN KEY (`promotion_id`) REFERENCES `restaurant_promotions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotion_menu_items` ADD CONSTRAINT `promotion_menu_items_menu_item_id_fkey` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payout_transactions` ADD CONSTRAINT `payout_transactions_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restaurant_payouts` ADD CONSTRAINT `restaurant_payouts_payout_transaction_id_fkey` FOREIGN KEY (`payout_transaction_id`) REFERENCES `payout_transactions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restaurant_payouts` ADD CONSTRAINT `restaurant_payouts_branch_head_id_fkey` FOREIGN KEY (`branch_head_id`) REFERENCES `restaurant_staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restaurant_payouts` ADD CONSTRAINT `restaurant_payouts_settlement_id_fkey` FOREIGN KEY (`settlement_id`) REFERENCES `settlements`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_partner_payouts` ADD CONSTRAINT `delivery_partner_payouts_payout_transaction_id_fkey` FOREIGN KEY (`payout_transaction_id`) REFERENCES `payout_transactions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_partner_payouts` ADD CONSTRAINT `delivery_partner_payouts_delivery_partner_id_fkey` FOREIGN KEY (`delivery_partner_id`) REFERENCES `delivery_partners`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_partner_payouts` ADD CONSTRAINT `delivery_partner_payouts_settlement_id_fkey` FOREIGN KEY (`settlement_id`) REFERENCES `settlements`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
