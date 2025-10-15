-- DropForeignKey
ALTER TABLE "public"."Attendance" DROP CONSTRAINT "Attendance_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Attendance" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
