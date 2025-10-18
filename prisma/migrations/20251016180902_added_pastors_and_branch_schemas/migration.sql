-- CreateTable
CREATE TABLE "public"."Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "income" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expenditure" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "events" TEXT,
    "currentProject" TEXT,
    "address" TEXT NOT NULL,
    "description" TEXT,
    "pastorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pastor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateAppointed" TIMESTAMP(3) NOT NULL,
    "currentStation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pastor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Branch" ADD CONSTRAINT "Branch_pastorId_fkey" FOREIGN KEY ("pastorId") REFERENCES "public"."Pastor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
