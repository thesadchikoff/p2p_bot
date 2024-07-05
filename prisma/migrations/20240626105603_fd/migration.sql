-- DropForeignKey
ALTER TABLE "contract" DROP CONSTRAINT "contract_user_id_fkey";

-- AlterTable
ALTER TABLE "contract" ALTER COLUMN "max_price" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
