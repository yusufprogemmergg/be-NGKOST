/*
  Warnings:

  - The `rules` column on the `Kos` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Kos" DROP COLUMN "rules",
ADD COLUMN     "rules" TEXT[];
