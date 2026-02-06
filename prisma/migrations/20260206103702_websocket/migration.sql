-- CreateTable
CREATE TABLE "WebSocket" (
    "id" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebSocket_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WebSocket" ADD CONSTRAINT "WebSocket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
