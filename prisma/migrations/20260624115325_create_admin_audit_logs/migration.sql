-- CreateTable
CREATE TABLE `admin_audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `admin_id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(100) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `old_value` JSON NULL,
    `new_value` JSON NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `admin_audit_logs_admin_id_idx`(`admin_id`),
    INDEX `admin_audit_logs_entity_type_idx`(`entity_type`),
    INDEX `admin_audit_logs_entity_id_idx`(`entity_id`),
    INDEX `admin_audit_logs_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin_audit_logs` ADD CONSTRAINT `admin_audit_logs_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
