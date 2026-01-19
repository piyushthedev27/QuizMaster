/*
  Warnings:

  - You are about to drop the column `unit` on the `questions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "questions" DROP COLUMN "unit";

-- CreateTable
CREATE TABLE "unit_questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "answer" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_questions_pkey" PRIMARY KEY ("id")
);
