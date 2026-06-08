/*
  Warnings:

  - The primary key for the `operating_hours` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `restaurant_branches` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `owner_id` on the `restaurant_branches` table. All the data in the column will be lost.
  - You are about to alter the column `delivery_radius_km` on the `restaurant_branches` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(5,2)`.
  - The primary key for the `restaurant_staff` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `restaurants` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `role` on the `roles` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(50)`.
  - The primary key for the `user_addresses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `updated_at` to the `operating_hours` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `restaurant_staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `restaurants` table without a default value. This is not possible if the table is not empty.
  - Made the column `is_default` on table `user_addresses` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `operating_hours` DROP FOREIGN KEY `operating_hours_branch_id_fkey`;

-- DropForeignKey
ALTER TABLE `restaurant_branches` DROP FOREIGN KEY `restaurant_branches_owner_id_fkey`;

-- DropForeignKey
ALTER TABLE `restaurant_branches` DROP FOREIGN KEY `restaurant_branches_restaurant_id_fkey`;

-- DropForeignKey
ALTER TABLE `restaurant_staff` DROP FOREIGN KEY `restaurant_staff_branch_id_fkey`;

-- DropForeignKey
ALTER TABLE `restaurant_staff` DROP FOREIGN KEY `restaurant_staff_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `restaurants` DROP FOREIGN KEY `restaurants_owner_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_addresses` DROP FOREIGN KEY `user_addresses_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_roles` DROP FOREIGN KEY `user_roles_role_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_roles` DROP FOREIGN KEY `user_roles_user_id_fkey`;

-- DropIndex
DROP INDEX `operating_hours_branch_id_day_of_week_key` ON `operating_hours`;

-- DropIndex
DROP INDEX `restaurant_branches_city_idx` ON `restaurant_branches`;

-- DropIndex
DROP INDEX `restaurant_branches_owner_id_fkey` ON `restaurant_branches`;

-- DropIndex
DROP INDEX `restaurant_branches_pincode_idx` ON `restaurant_branches`;

-- DropIndex
DROP INDEX `restaurant_branches_state_idx` ON `restaurant_branches`;

-- DropIndex
DROP INDEX `user_roles_role_id_idx` ON `user_roles`;

-- DropIndex
DROP INDEX `user_roles_user_id_idx` ON `user_roles`;

-- AlterTable
ALTER TABLE `operating_hours` DROP PRIMARY KEY,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `branch_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `restaurant_branches` DROP PRIMARY KEY,
    DROP COLUMN `owner_id`,
    ADD COLUMN `head_id` VARCHAR(191) NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `restaurant_id` VARCHAR(191) NOT NULL,
    MODIFY `address_line1` TEXT NULL,
    MODIFY `address_line2` TEXT NULL,
    MODIFY `delivery_radius_km` DECIMAL(5, 2) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `restaurant_staff` DROP PRIMARY KEY,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    MODIFY `branch_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `restaurants` DROP PRIMARY KEY,
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `owner_id` VARCHAR(191) NOT NULL,
    MODIFY `description` TEXT NULL,
    MODIFY `logo_url` TEXT NULL,
    MODIFY `cover_image_url` TEXT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `roles` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `role` VARCHAR(50) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `user_addresses` DROP PRIMARY KEY,
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    MODIFY `address_line1` TEXT NULL,
    MODIFY `address_line2` TEXT NULL,
    MODIFY `is_default` BOOLEAN NOT NULL DEFAULT false,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `user_roles` DROP PRIMARY KEY,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    MODIFY `role_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`user_id`, `role_id`);

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `profile_photo` TEXT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `branch_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `categories_branch_id_idx`(`branch_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_items` (
    `id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10, 2) NULL,
    `is_veg` BOOLEAN NOT NULL DEFAULT true,
    `image_url` TEXT NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT true,
    `is_bestseller` BOOLEAN NOT NULL DEFAULT false,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `menu_items_category_id_idx`(`category_id`),
    INDEX `menu_items_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dietary_tags` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_item_tags` (
    `id` VARCHAR(191) NOT NULL,
    `menu_item_id` VARCHAR(191) NOT NULL,
    `tag_id` VARCHAR(191) NOT NULL,

    INDEX `menu_item_tags_menu_item_id_idx`(`menu_item_id`),
    INDEX `menu_item_tags_tag_id_idx`(`tag_id`),
    UNIQUE INDEX `menu_item_tags_menu_item_id_tag_id_key`(`menu_item_id`, `tag_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modifier_groups` (
    `id` VARCHAR(191) NOT NULL,
    `menu_item_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `min_selection` INTEGER NOT NULL DEFAULT 0,
    `max_selection` INTEGER NOT NULL DEFAULT 1,
    `is_required` BOOLEAN NOT NULL DEFAULT false,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,

    INDEX `modifier_groups_menu_item_id_idx`(`menu_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modifier_options` (
    `id` VARCHAR(191) NOT NULL,
    `modifier_group_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `extra_price` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,

    INDEX `modifier_options_modifier_group_id_idx`(`modifier_group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupons` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `type` ENUM('PERCENTAGE', 'FLAT', 'FREE_DELIVERY', 'BOGO') NOT NULL,
    `discount_value` DECIMAL(10, 2) NULL,
    `min_order_amount` DECIMAL(10, 2) NULL,
    `max_discount` DECIMAL(10, 2) NULL,
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,
    `usage_limit` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `coupons_code_key`(`code`),
    INDEX `coupons_code_idx`(`code`),
    INDEX `coupons_type_idx`(`type`),
    INDEX `coupons_start_date_idx`(`start_date`),
    INDEX `coupons_end_date_idx`(`end_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupon_usages` (
    `id` VARCHAR(191) NOT NULL,
    `coupon_id` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `used_at` DATETIME(3) NULL,

    INDEX `coupon_usages_coupon_id_idx`(`coupon_id`),
    INDEX `coupon_usages_customer_id_idx`(`customer_id`),
    INDEX `coupon_usages_order_id_idx`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restaurant_promotions` (
    `id` VARCHAR(191) NOT NULL,
    `restaurant_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `type` ENUM('FIXED', 'PERCENTAGE', 'FREE_DELIVERY', 'BOGO') NOT NULL,
    `discount_value` DECIMAL(10, 2) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,

    INDEX `restaurant_promotions_restaurant_id_idx`(`restaurant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loyalty_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NOT NULL,
    `current_points` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `loyalty_accounts_customer_id_key`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loyalty_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `account_id` VARCHAR(191) NOT NULL,
    `points` INTEGER NOT NULL,
    `transaction_type` ENUM('EARN', 'REDEEM') NOT NULL,
    `reference_order_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `loyalty_transactions_account_id_idx`(`account_id`),
    INDEX `loyalty_transactions_reference_order_id_idx`(`reference_order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `order_number` VARCHAR(50) NOT NULL,
    `customer_id` VARCHAR(191) NOT NULL,
    `branch_id` VARCHAR(191) NOT NULL,
    `address_id` VARCHAR(191) NOT NULL,
    `coupon_id` VARCHAR(191) NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `tax_amount` DECIMAL(10, 2) NOT NULL,
    `delivery_fee` DECIMAL(10, 2) NOT NULL,
    `discount_amount` DECIMAL(10, 2) NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED') NOT NULL,
    `payment_status` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL,
    `scheduled_at` DATETIME(3) NULL,
    `placed_at` DATETIME(3) NOT NULL,
    `delivered_at` DATETIME(3) NULL,

    UNIQUE INDEX `orders_order_number_key`(`order_number`),
    INDEX `orders_customer_id_idx`(`customer_id`),
    INDEX `orders_branch_id_idx`(`branch_id`),
    INDEX `orders_status_idx`(`status`),
    INDEX `orders_payment_status_idx`(`payment_status`),
    INDEX `orders_placed_at_idx`(`placed_at`),
    INDEX `orders_customer_id_status_idx`(`customer_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `menu_item_id` VARCHAR(191) NULL,
    `menu_item_name` VARCHAR(255) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `special_instruction` TEXT NULL,

    INDEX `order_items_order_id_idx`(`order_id`),
    INDEX `order_items_menu_item_id_idx`(`menu_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_item_modifiers` (
    `id` VARCHAR(191) NOT NULL,
    `order_item_id` VARCHAR(191) NOT NULL,
    `modifier_name` VARCHAR(255) NOT NULL,
    `extra_price` DECIMAL(10, 2) NOT NULL,

    INDEX `order_item_modifiers_order_item_id_idx`(`order_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_status_history` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `old_status` VARCHAR(50) NULL,
    `new_status` VARCHAR(50) NULL,
    `changed_by` VARCHAR(191) NULL,
    `changed_at` DATETIME(3) NULL,

    INDEX `order_status_history_order_id_idx`(`order_id`),
    INDEX `order_status_history_changed_by_idx`(`changed_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_partners` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `vehicle_type` ENUM('BIKE', 'SCOOTER', 'BICYCLE', 'CAR') NOT NULL,
    `vehicle_number` VARCHAR(30) NOT NULL,
    `government_id` VARCHAR(100) NOT NULL,
    `status` ENUM('PENDING_VERIFICATION', 'ACTIVE', 'INACTIVE', 'ON_DELIVERY', 'SUSPENDED') NOT NULL DEFAULT 'PENDING_VERIFICATION',
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `delivery_partners_user_id_key`(`user_id`),
    UNIQUE INDEX `delivery_partners_vehicle_number_key`(`vehicle_number`),
    INDEX `delivery_partners_user_id_idx`(`user_id`),
    INDEX `delivery_partners_vehicle_number_idx`(`vehicle_number`),
    INDEX `delivery_partners_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deliveries` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `current_partner_id` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'DELIVERED') NOT NULL DEFAULT 'PENDING',
    `accepted_at` DATETIME(3) NULL,
    `picked_up_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,

    UNIQUE INDEX `deliveries_order_id_key`(`order_id`),
    INDEX `deliveries_current_partner_id_idx`(`current_partner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_assignments` (
    `id` VARCHAR(191) NOT NULL,
    `delivery_id` VARCHAR(191) NOT NULL,
    `partner_id` VARCHAR(191) NOT NULL,
    `assigned_at` DATETIME(3) NOT NULL,
    `responded_at` DATETIME(3) NULL,
    `response_status` ENUM('ACCEPTED', 'REJECTED', 'TIMED_OUT') NULL,

    INDEX `delivery_assignments_delivery_id_idx`(`delivery_id`),
    INDEX `delivery_assignments_partner_id_idx`(`partner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `payment_method` ENUM('CARD', 'UPI', 'WALLET', 'NET_BANKING', 'COD') NOT NULL,
    `gateway` VARCHAR(100) NULL,
    `gateway_transaction_id` VARCHAR(255) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `payments_order_id_idx`(`order_id`),
    INDEX `payments_payment_method_idx`(`payment_method`),
    INDEX `payments_status_idx`(`status`),
    INDEX `payments_gateway_transaction_id_idx`(`gateway_transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_methods` (
    `id` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NOT NULL,
    `method_type` VARCHAR(30) NULL,
    `provider` VARCHAR(50) NULL,
    `token` VARCHAR(255) NULL,
    `display_name` VARCHAR(100) NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `payment_methods_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refunds` (
    `id` VARCHAR(191) NOT NULL,
    `payment_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `reason` TEXT NOT NULL,
    `refund_type` ENUM('FULL', 'PARTIAL') NOT NULL,
    `status` ENUM('REQUESTED', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'REQUESTED',
    `gateway_refund_id` VARCHAR(255) NULL,
    `requested_at` DATETIME(3) NULL,
    `processed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `refunds_payment_id_idx`(`payment_id`),
    INDEX `refunds_user_id_idx`(`user_id`),
    INDEX `refunds_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `branch_id` VARCHAR(191) NOT NULL,
    `delivery_partner_id` VARCHAR(191) NULL,
    `food_rating` INTEGER NULL,
    `delivery_rating` INTEGER NULL,
    `packaging_rating` INTEGER NULL,
    `review_text` TEXT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reviews_order_id_key`(`order_id`),
    INDEX `reviews_order_id_idx`(`order_id`),
    INDEX `reviews_user_id_idx`(`user_id`),
    INDEX `reviews_branch_id_idx`(`branch_id`),
    INDEX `reviews_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review_images` (
    `id` VARCHAR(191) NOT NULL,
    `review_id` VARCHAR(191) NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,

    INDEX `review_images_review_id_idx`(`review_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_tickets` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NULL,
    `customer_id` VARCHAR(191) NOT NULL,
    `assigned_admin` VARCHAR(191) NULL,
    `issue_type` ENUM('DELIVERY', 'PAYMENT', 'ORDER', 'PRODUCT') NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolved_at` DATETIME(3) NULL,

    INDEX `support_tickets_order_id_idx`(`order_id`),
    INDEX `support_tickets_customer_id_idx`(`customer_id`),
    INDEX `support_tickets_assigned_admin_idx`(`assigned_admin`),
    INDEX `support_tickets_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_attachments` (
    `id` VARCHAR(191) NOT NULL,
    `ticket_id` VARCHAR(191) NOT NULL,
    `file_url` VARCHAR(255) NOT NULL,

    INDEX `ticket_attachments_ticket_id_idx`(`ticket_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `notification_type` ENUM('INFO', 'ALERT', 'ORDER_UPDATE') NOT NULL,
    `status` ENUM('PENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `sent_at` DATETIME(3) NULL,
    `read_at` DATETIME(3) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,

    INDEX `notifications_user_id_idx`(`user_id`),
    INDEX `notifications_status_idx`(`status`),
    INDEX `notifications_notification_type_idx`(`notification_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `restaurant_branches_head_id_idx` ON `restaurant_branches`(`head_id`);

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_addresses` ADD CONSTRAINT `user_addresses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restaurants` ADD CONSTRAINT `restaurants_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restaurant_branches` ADD CONSTRAINT `restaurant_branches_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restaurant_branches` ADD CONSTRAINT `restaurant_branches_head_id_fkey` FOREIGN KEY (`head_id`) REFERENCES `restaurant_staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `operating_hours` ADD CONSTRAINT `operating_hours_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `restaurant_branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restaurant_staff` ADD CONSTRAINT `restaurant_staff_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restaurant_staff` ADD CONSTRAINT `restaurant_staff_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `restaurant_branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `restaurant_branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_items` ADD CONSTRAINT `menu_items_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_item_tags` ADD CONSTRAINT `menu_item_tags_menu_item_id_fkey` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_item_tags` ADD CONSTRAINT `menu_item_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `dietary_tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `modifier_groups` ADD CONSTRAINT `modifier_groups_menu_item_id_fkey` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `modifier_options` ADD CONSTRAINT `modifier_options_modifier_group_id_fkey` FOREIGN KEY (`modifier_group_id`) REFERENCES `modifier_groups`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coupon_usages` ADD CONSTRAINT `coupon_usages_coupon_id_fkey` FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coupon_usages` ADD CONSTRAINT `coupon_usages_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coupon_usages` ADD CONSTRAINT `coupon_usages_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restaurant_promotions` ADD CONSTRAINT `restaurant_promotions_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loyalty_accounts` ADD CONSTRAINT `loyalty_accounts_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loyalty_transactions` ADD CONSTRAINT `loyalty_transactions_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `loyalty_accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loyalty_transactions` ADD CONSTRAINT `loyalty_transactions_reference_order_id_fkey` FOREIGN KEY (`reference_order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `restaurant_branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_address_id_fkey` FOREIGN KEY (`address_id`) REFERENCES `user_addresses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_coupon_id_fkey` FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_menu_item_id_fkey` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item_modifiers` ADD CONSTRAINT `order_item_modifiers_order_item_id_fkey` FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_status_history` ADD CONSTRAINT `order_status_history_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_status_history` ADD CONSTRAINT `order_status_history_changed_by_fkey` FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_partners` ADD CONSTRAINT `delivery_partners_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_current_partner_id_fkey` FOREIGN KEY (`current_partner_id`) REFERENCES `delivery_partners`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_assignments` ADD CONSTRAINT `delivery_assignments_delivery_id_fkey` FOREIGN KEY (`delivery_id`) REFERENCES `deliveries`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_assignments` ADD CONSTRAINT `delivery_assignments_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `delivery_partners`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_methods` ADD CONSTRAINT `payment_methods_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `restaurant_branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_delivery_partner_id_fkey` FOREIGN KEY (`delivery_partner_id`) REFERENCES `delivery_partners`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_images` ADD CONSTRAINT `review_images_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_tickets` ADD CONSTRAINT `support_tickets_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_tickets` ADD CONSTRAINT `support_tickets_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_tickets` ADD CONSTRAINT `support_tickets_assigned_admin_fkey` FOREIGN KEY (`assigned_admin`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_attachments` ADD CONSTRAINT `ticket_attachments_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
