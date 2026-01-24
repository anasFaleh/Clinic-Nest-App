/*
  Warnings:

  - You are about to drop the column `age` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `age` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "age",
ADD COLUMN     "dateOfBirth" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "age",
ADD COLUMN     "dateOfBirth" TIMESTAMP(3);
