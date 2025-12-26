/*
  Warnings:

  - You are about to drop the column `creatorId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `EventManager` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `type` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventManager" DROP CONSTRAINT "EventManager_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventManager" DROP CONSTRAINT "EventManager_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Event" DROP COLUMN "creatorId",
ADD COLUMN     "imageUrls" TEXT[],
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxAttendees" INTEGER,
ADD COLUMN     "registrationRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT',
DROP COLUMN "type",
ADD COLUMN     "type" "public"."ServiceType" NOT NULL;

-- DropTable
DROP TABLE "public"."EventManager";

-- CreateIndex
CREATE INDEX "Event_startTime_idx" ON "public"."Event"("startTime");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "public"."Event"("status");

-- CreateIndex
CREATE INDEX "Event_type_idx" ON "public"."Event"("type");
