-- AlterTable
ALTER TABLE "users" ADD COLUMN     "total_amount_add" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_amount_replenish" INTEGER NOT NULL DEFAULT 0;
