-- CreateEnum
CREATE TYPE "LaunchpadStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'LIVE', 'ENDED', 'REJECTED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "launchpadId" INTEGER;

-- CreateTable
CREATE TABLE "Launchpad" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "discountRate" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "status" "LaunchpadStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "maxPurchasesPerUser" INTEGER,
    "rejectionReason" TEXT,
    "createdById" INTEGER NOT NULL,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Launchpad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Launchpad_status_endTime_idx" ON "Launchpad"("status", "endTime");

-- CreateIndex
CREATE INDEX "Launchpad_productId_status_idx" ON "Launchpad"("productId", "status");

-- CreateIndex
CREATE INDEX "Launchpad_createdById_status_idx" ON "Launchpad"("createdById", "status");

-- CreateIndex
CREATE INDEX "Launchpad_deletedAt_idx" ON "Launchpad"("deletedAt");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_launchpadId_fkey" FOREIGN KEY ("launchpadId") REFERENCES "Launchpad"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Launchpad" ADD CONSTRAINT "Launchpad_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Launchpad" ADD CONSTRAINT "Launchpad_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Launchpad" ADD CONSTRAINT "Launchpad_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Launchpad" ADD CONSTRAINT "Launchpad_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
