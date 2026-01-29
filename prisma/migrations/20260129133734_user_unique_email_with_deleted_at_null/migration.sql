-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_totpSecret_key";

-- Create unique index for email with condition deletedAt = null
CREATE UNIQUE INDEX user_unique_email_with_deletedAt_null
ON "User" (email)
WHERE "deletedAt" IS NULL;