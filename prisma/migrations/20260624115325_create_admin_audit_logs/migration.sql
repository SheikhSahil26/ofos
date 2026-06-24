CREATE TABLE `admin_audit_logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_value` JSON DEFAULT NULL,
  `new_value` JSON DEFAULT NULL,
  `description` TEXT COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),

  KEY `admin_audit_logs_admin_id_idx` (`admin_id`),
  KEY `admin_audit_logs_entity_type_idx` (`entity_type`),
  KEY `admin_audit_logs_entity_id_idx` (`entity_id`),
  KEY `admin_audit_logs_action_idx` (`action`),

  CONSTRAINT `admin_audit_logs_admin_id_fkey`
    FOREIGN KEY (`admin_id`)
    REFERENCES `users` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;