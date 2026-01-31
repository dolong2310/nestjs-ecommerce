/*
  Warnings:

  - Added the required column `name` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "logo" VARCHAR(1000),
ADD COLUMN     "name" VARCHAR(500) NOT NULL;

-- Add unique index to CategoryTranslation table
CREATE UNIQUE INDEX category_translation_unique_category_id_language_id_where_deleted_at_null
ON "CategoryTranslation" ("categoryId", "languageId")
WHERE "deletedAt" IS NULL;