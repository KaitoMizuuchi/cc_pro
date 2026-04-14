-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('STORED', 'LENDING');

-- CreateTable
CREATE TABLE "books" (
    "id" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "category" TEXT,
    "cover_image_url" TEXT,
    "status" "BookStatus" NOT NULL DEFAULT 'STORED',
    "registrant_id" TEXT NOT NULL,
    "borrower_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_registrant_id_fkey" FOREIGN KEY ("registrant_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_borrower_id_fkey" FOREIGN KEY ("borrower_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
