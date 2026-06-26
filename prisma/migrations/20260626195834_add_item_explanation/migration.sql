-- AlterTable
ALTER TABLE "items" ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "explanationModel" TEXT,
ADD COLUMN     "explanationUpdatedAt" TIMESTAMP(3);
