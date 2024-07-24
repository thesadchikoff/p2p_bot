/*
  Warnings:

  - Added the required column `code` to the `codes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "codes" ADD COLUMN     "code" TEXT NOT NULL;
