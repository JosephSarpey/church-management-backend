-- CreateTable
CREATE TABLE "public"."ChurchSettings" (
    "id" TEXT NOT NULL,
    "churchName" TEXT NOT NULL DEFAULT 'Zion Chapel',
    "pastorName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "dateFormat" TEXT NOT NULL DEFAULT 'MM/dd/yyyy',
    "timeFormat" TEXT NOT NULL DEFAULT 'hh:mm a',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchSettings_pkey" PRIMARY KEY ("id")
);
