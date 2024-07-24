-- CreateTable
CREATE TABLE "address_book" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "address_book_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "address_book" ADD CONSTRAINT "address_book_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
