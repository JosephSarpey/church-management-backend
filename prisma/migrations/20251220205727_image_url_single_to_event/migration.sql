/*
  Warnings:

  - You are about to drop the column `imageUrls` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Event" DROP COLUMN "imageUrls",
ADD COLUMN     "imageUrl" TEXT;
