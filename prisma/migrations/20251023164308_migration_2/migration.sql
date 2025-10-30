/*
  Warnings:

  - You are about to drop the column `address` on the `Profile` table. All the data in the column will be lost.
  - Added the required column `fullName` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "address",
ADD COLUMN     "cityOrigin" TEXT,
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "institution" TEXT,
ADD COLUMN     "lastEducation" TEXT,
ADD COLUMN     "status" TEXT;
