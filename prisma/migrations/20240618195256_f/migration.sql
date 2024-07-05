/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Requisite" DROP CONSTRAINT "Requisite_userId_fkey";

-- DropForeignKey
ALTER TABLE "contract" DROP CONSTRAINT "contract_user_id_fkey";

-- DropForeignKey
ALTER TABLE "contract_transaction" DROP CONSTRAINT "contract_transaction_buyer_id_fkey";

-- DropForeignKey
ALTER TABLE "contract_transaction" DROP CONSTRAINT "contract_transaction_seller_id_fkey";

-- DropForeignKey
ALTER TABLE "transfers" DROP CONSTRAINT "transfers_from_user_fkey";

-- DropForeignKey
ALTER TABLE "transfers" DROP CONSTRAINT "transfers_to_user_id_fkey";

-- AlterTable
ALTER TABLE "Requisite" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "contract" ALTER COLUMN "user_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "contract_transaction" ALTER COLUMN "seller_id" SET DATA TYPE TEXT,
ALTER COLUMN "buyer_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "transfers" ALTER COLUMN "from_user" SET DATA TYPE TEXT,
ALTER COLUMN "to_user_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_from_user_fkey" FOREIGN KEY ("from_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requisite" ADD CONSTRAINT "Requisite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_transaction" ADD CONSTRAINT "contract_transaction_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_transaction" ADD CONSTRAINT "contract_transaction_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
