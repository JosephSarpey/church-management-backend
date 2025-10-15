/*
  Warnings:

  - You are about to drop the column `userId` on the `Member` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[memberNumber]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firstName` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Member" DROP CONSTRAINT "Member_userId_fkey";

-- DropIndex
DROP INDEX "public"."Member_userId_key";

-- AlterTable
ALTER TABLE "public"."Member" DROP COLUMN "userId",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "memberNumber" SERIAL NOT NULL,
ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Member_memberNumber_key" ON "public"."Member"("memberNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "public"."Member"("email");
