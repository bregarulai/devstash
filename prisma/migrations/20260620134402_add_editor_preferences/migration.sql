-- AlterTable
ALTER TABLE "users" ADD COLUMN     "editorPreferences" JSONB;

-- AlterTable
ALTER TABLE "verification_tokens" ALTER COLUMN "id" DROP DEFAULT;
