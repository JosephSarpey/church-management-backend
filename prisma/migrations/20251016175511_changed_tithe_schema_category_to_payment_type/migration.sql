/*
  Warnings:

  - You are about to drop the column `category` on the `Tithe` table. All the data in the column will be lost.
  - Added the required column `paymentType` to the `Tithe` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Tithe" DROP COLUMN "category",
ADD COLUMN     "paymentType" TEXT NOT NULL;
