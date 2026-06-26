-- AlterTable
ALTER TABLE "items" ADD COLUMN     "optimized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "optimizedAt" TIMESTAMP(3);
