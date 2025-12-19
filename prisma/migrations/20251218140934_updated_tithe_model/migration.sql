/*
  Warnings:

  - You are about to drop the column `recordedById` on the `Tithe` table. All the data in the column will be lost.
  - Added the required column `recordedBy` to the `Tithe` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `paymentMethod` on the `Tithe` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `paymentType` on the `Tithe` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('TITHE', 'OFFERING', 'DONATION', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CREDIT_CARD', 'OTHER');

-- DropForeignKey
ALTER TABLE "public"."Tithe" DROP CONSTRAINT "Tithe_recordedById_fkey";

-- AlterTable
ALTER TABLE "public"."Tithe" DROP COLUMN "recordedById",
ADD COLUMN     "recordedBy" TEXT NOT NULL,
DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentMethod" "public"."PaymentMethod" NOT NULL,
DROP COLUMN "paymentType",
ADD COLUMN     "paymentType" "public"."PaymentType" NOT NULL;

-- CreateIndex
CREATE INDEX "Tithe_memberId_idx" ON "public"."Tithe"("memberId");

-- CreateIndex
CREATE INDEX "Tithe_paymentDate_idx" ON "public"."Tithe"("paymentDate");
