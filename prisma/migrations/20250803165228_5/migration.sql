-- CreateTable
CREATE TABLE "TempRole" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TempRole_pkey" PRIMARY KEY ("id")
);
