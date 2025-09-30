/*
  Warnings:

  - You are about to drop the column `kosId` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerMonth` on the `Kos` table. All the data in the column will be lost.
  - You are about to drop the column `kosId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the `KosFacility` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `kamarKosId` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Kos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Kos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kamarKosId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_kosId_fkey";

-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_userId_fkey";

-- DropForeignKey
ALTER TABLE "Kos" DROP CONSTRAINT "Kos_userId_fkey";

-- DropForeignKey
ALTER TABLE "KosFacility" DROP CONSTRAINT "KosFacility_kosId_fkey";

-- DropForeignKey
ALTER TABLE "KosImage" DROP CONSTRAINT "KosImage_kosId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_kosId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "kosId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "kamarKosId" INTEGER NOT NULL,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Kos" DROP COLUMN "pricePerMonth",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "priceFrom" INTEGER,
ADD COLUMN     "priceTo" INTEGER,
ADD COLUMN     "rules" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "KosImage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isMain" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "kosId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "kamarKosId" INTEGER NOT NULL,
ADD COLUMN     "rating" INTEGER DEFAULT 5;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'user';

-- DropTable
DROP TABLE "KosFacility";

-- CreateTable
CREATE TABLE "KamarKos" (
    "id" SERIAL NOT NULL,
    "kosId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "totalRooms" INTEGER NOT NULL DEFAULT 1,
    "available" INTEGER NOT NULL DEFAULT 1,
    "pricePerMonth" INTEGER NOT NULL,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KamarKos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FasilitasUmum" (
    "id" SERIAL NOT NULL,
    "kosId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FasilitasUmum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fasilitas" (
    "id" SERIAL NOT NULL,
    "kamarKosId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fasilitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KamarKosImage" (
    "id" SERIAL NOT NULL,
    "kamarKosId" INTEGER NOT NULL,
    "file" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KamarKosImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Kos" ADD CONSTRAINT "Kos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KamarKos" ADD CONSTRAINT "KamarKos_kosId_fkey" FOREIGN KEY ("kosId") REFERENCES "Kos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FasilitasUmum" ADD CONSTRAINT "FasilitasUmum_kosId_fkey" FOREIGN KEY ("kosId") REFERENCES "Kos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fasilitas" ADD CONSTRAINT "Fasilitas_kamarKosId_fkey" FOREIGN KEY ("kamarKosId") REFERENCES "KamarKos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KosImage" ADD CONSTRAINT "KosImage_kosId_fkey" FOREIGN KEY ("kosId") REFERENCES "Kos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KamarKosImage" ADD CONSTRAINT "KamarKosImage_kamarKosId_fkey" FOREIGN KEY ("kamarKosId") REFERENCES "KamarKos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_kamarKosId_fkey" FOREIGN KEY ("kamarKosId") REFERENCES "KamarKos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_kamarKosId_fkey" FOREIGN KEY ("kamarKosId") REFERENCES "KamarKos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
