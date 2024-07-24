/*
  Warnings:

  - A unique constraint covering the columns `[seller_id]` on the table `contract_transaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[buyer_id]` on the table `contract_transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "contract_transaction" DROP CONSTRAINT "contract_transaction_buyer_id_fkey";

-- DropForeignKey
ALTER TABLE "contract_transaction" DROP CONSTRAINT "contract_transaction_seller_id_fkey";

-- AlterTable
ALTER TABLE "contract_transaction" ALTER COLUMN "seller_id" DROP NOT NULL,
ALTER COLUMN "buyer_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "BuyContractTransactionId" TEXT,
ADD COLUMN     "SellContractTransactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "contract_transaction_seller_id_key" ON "contract_transaction"("seller_id");

-- CreateIndex
CREATE UNIQUE INDEX "contract_transaction_buyer_id_key" ON "contract_transaction"("buyer_id");

-- AddForeignKey
ALTER TABLE "contract_transaction" ADD CONSTRAINT "contract_transaction_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_transaction" ADD CONSTRAINT "contract_transaction_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
