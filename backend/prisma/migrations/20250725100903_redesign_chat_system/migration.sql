/*
  Warnings:

  - You are about to drop the column `bookingId` on the `chats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[listingId,renterId]` on the table `chats` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `listingId` to the `chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `renterId` to the `chats` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_bookingId_fkey";

-- DropIndex
DROP INDEX "chats_bookingId_key";

-- AlterTable
ALTER TABLE "chats" DROP COLUMN "bookingId",
ADD COLUMN     "listingId" TEXT NOT NULL,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "renterId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "chats_listingId_renterId_key" ON "chats"("listingId", "renterId");

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
