/*
  Warnings:

  - Made the column `name` on table `Brand` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
-- Add DEFAULT first
ALTER TABLE "Brand" ALTER COLUMN "name" SET DEFAULT '';

-- Update values NULL currently
UPDATE "Brand" SET "name" = '' WHERE "name" IS NULL;

-- Then set NOT NULL
ALTER TABLE "Brand" ALTER COLUMN "name" SET NOT NULL;
