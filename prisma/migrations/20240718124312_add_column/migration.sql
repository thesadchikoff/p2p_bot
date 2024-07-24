/*
  Warnings:

  - Added the required column `contract_id` to the `contract_transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contract_transaction" ADD COLUMN     "contract_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "contract_transaction" ADD CONSTRAINT "contract_transaction_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
