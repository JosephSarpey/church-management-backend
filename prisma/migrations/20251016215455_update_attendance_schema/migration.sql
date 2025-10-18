/*
  Warnings:

  - You are about to drop the column `checkIn` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `checkOut` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `recordedById` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Attendance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[memberId,serviceType,date]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceType` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ServiceType" AS ENUM ('SUNDAY_SERVICE', 'BIBLE_STUDY', 'PRAYER_MEETING', 'YOUTH_SERVICE', 'CHILDREN_SERVICE', 'SPECIAL_EVENT', 'OTHER');

-- DropForeignKey
ALTER TABLE "public"."Attendance" DROP CONSTRAINT "Attendance_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Attendance" DROP CONSTRAINT "Attendance_recordedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Attendance" DROP CONSTRAINT "Attendance_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Attendance" DROP COLUMN "checkIn",
DROP COLUMN "checkOut",
DROP COLUMN "eventId",
DROP COLUMN "recordedById",
DROP COLUMN "userId",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "serviceType" "public"."ServiceType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_memberId_serviceType_date_key" ON "public"."Attendance"("memberId", "serviceType", "date");
