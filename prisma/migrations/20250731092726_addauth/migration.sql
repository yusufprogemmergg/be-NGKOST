/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `oauthProviderId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('owner', 'society');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'all');

-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('pending', 'accept', 'reject');

-- DropIndex
DROP INDEX "User_oauthProvider_oauthProviderId_key";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "image",
DROP COLUMN "oauthProviderId",
DROP COLUMN "passwordHash",
DROP COLUMN "updatedAt",
ADD COLUMN     "oauthId" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" "Role" NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Kos" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "pricePerMonth" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,

    CONSTRAINT "Kos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KosImage" (
    "id" SERIAL NOT NULL,
    "kosId" INTEGER NOT NULL,
    "file" TEXT NOT NULL,

    CONSTRAINT "KosImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KosFacility" (
    "id" SERIAL NOT NULL,
    "kosId" INTEGER NOT NULL,
    "facility" TEXT NOT NULL,

    CONSTRAINT "KosFacility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "kosId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "kosId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "BookStatus" NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Kos" ADD CONSTRAINT "Kos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KosImage" ADD CONSTRAINT "KosImage_kosId_fkey" FOREIGN KEY ("kosId") REFERENCES "Kos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KosFacility" ADD CONSTRAINT "KosFacility_kosId_fkey" FOREIGN KEY ("kosId") REFERENCES "Kos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_kosId_fkey" FOREIGN KEY ("kosId") REFERENCES "Kos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_kosId_fkey" FOREIGN KEY ("kosId") REFERENCES "Kos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
