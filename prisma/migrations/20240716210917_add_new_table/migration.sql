-- CreateTable
CREATE TABLE "codes" (
    "id" SERIAL NOT NULL,
    "creatorId" TEXT,
    "amount_coins" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_subscribers" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_subscribers_AB_unique" ON "_subscribers"("A", "B");

-- CreateIndex
CREATE INDEX "_subscribers_B_index" ON "_subscribers"("B");

-- AddForeignKey
ALTER TABLE "codes" ADD CONSTRAINT "codes_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_subscribers" ADD CONSTRAINT "_subscribers_A_fkey" FOREIGN KEY ("A") REFERENCES "codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_subscribers" ADD CONSTRAINT "_subscribers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
