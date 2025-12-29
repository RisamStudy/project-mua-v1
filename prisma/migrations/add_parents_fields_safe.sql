-- Add parents fields to clients table safely
ALTER TABLE `clients` 
ADD COLUMN `bride_parents` VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN `groom_parents` VARCHAR(255) NOT NULL DEFAULT '';

-- Update existing records with placeholder values if needed
UPDATE `clients` 
SET `bride_parents` = 'Data belum diisi', 
    `groom_parents` = 'Data belum diisi' 
WHERE `bride_parents` = '' OR `groom_parents` = '';