-- CreateEnum
CREATE TYPE "public"."MembershipStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- AlterTable
ALTER TABLE "public"."Member" ADD COLUMN     "membershipStatus" "public"."MembershipStatus" NOT NULL DEFAULT 'ACTIVE';
