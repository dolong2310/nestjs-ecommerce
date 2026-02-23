/*
  Warnings:

  - The `discountType` column on the `Coupon` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CouponDiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" INTEGER,
DROP COLUMN "discountType",
ADD COLUMN     "discountType" "CouponDiscountType" NOT NULL DEFAULT 'PERCENTAGE';

-- DropEnum
DROP TYPE "DiscountType";

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
