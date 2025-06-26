/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdById` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "otp" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "verify" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Company_phone_key" ON "Company"("phone");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
