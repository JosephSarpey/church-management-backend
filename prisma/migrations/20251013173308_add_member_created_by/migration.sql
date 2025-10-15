-- AlterTable
ALTER TABLE "public"."Member" ADD COLUMN     "createdById" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Member" ADD CONSTRAINT "Member_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
