-- AlterTable
ALTER TABLE "public"."Member" ALTER COLUMN "memberNumber" SET DEFAULT '0001',
ALTER COLUMN "memberNumber" DROP DEFAULT,
ALTER COLUMN "memberNumber" SET DATA TYPE TEXT;
DROP SEQUENCE "Member_memberNumber_seq";
