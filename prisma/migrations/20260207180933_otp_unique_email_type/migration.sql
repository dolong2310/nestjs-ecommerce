/*
  Warnings:

  - A unique constraint covering the columns `[email,type]` on the table `OtpCode` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "OtpCode_email_code_type_key";

-- CreateIndex
CREATE UNIQUE INDEX "OtpCode_email_type_key" ON "OtpCode"("email", "type");
