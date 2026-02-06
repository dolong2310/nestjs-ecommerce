/*
  Warnings:

  - The primary key for the `WebSocket` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "WebSocket" DROP CONSTRAINT "WebSocket_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "WebSocket_pkey" PRIMARY KEY ("id");
