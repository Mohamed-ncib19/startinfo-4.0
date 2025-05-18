-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN "hints" JSONB;
ALTER TABLE "Lesson" ADD COLUMN "objectives" JSONB;

-- AlterTable
ALTER TABLE "Simulator" ADD COLUMN "wokwiId" TEXT;
