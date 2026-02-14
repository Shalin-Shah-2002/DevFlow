-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "githubId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "issues" ALTER COLUMN "githubId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "labels" ALTER COLUMN "githubId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "milestones" ALTER COLUMN "githubId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "repositories" ALTER COLUMN "githubId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "githubId" SET DATA TYPE BIGINT;
