/*
  Warnings:

  - Added the required column `max_price` to the `contract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contract" ADD COLUMN     "max_price" DOUBLE PRECISION NOT NULL;
