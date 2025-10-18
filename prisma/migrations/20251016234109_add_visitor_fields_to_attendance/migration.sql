/*
  Warnings:

  - A unique constraint covering the columns `[memberId,serviceType,date,isVisitor]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Attendance" DROP CONSTRAINT "Attendance_memberId_fkey";

-- DropIndex
DROP INDEX "public"."Attendance_memberId_serviceType_date_key";

-- AlterTable
ALTER TABLE "public"."Attendance" ADD COLUMN     "address" TEXT,
ADD COLUMN     "contact" TEXT,
ADD COLUMN     "isVisitor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "visitorName" TEXT,
ALTER COLUMN "memberId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_memberId_serviceType_date_isVisitor_key" ON "public"."Attendance"("memberId", "serviceType", "date", "isVisitor");

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
