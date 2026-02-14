-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "githubId" INTEGER NOT NULL,
    "githubLogin" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "bio" TEXT,
    "location" TEXT,
    "company" TEXT,
    "website" TEXT,
    "githubUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repositories" (
    "id" TEXT NOT NULL,
    "githubId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "openIssuesCount" INTEGER NOT NULL DEFAULT 0,
    "webhookId" TEXT,
    "webhookEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repositories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_repositories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "group" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_repositories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issues" (
    "id" TEXT NOT NULL,
    "githubId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "state" TEXT NOT NULL,
    "stateReason" TEXT,
    "repositoryId" TEXT NOT NULL,
    "creatorId" TEXT,
    "githubCreatedAt" TIMESTAMP(3) NOT NULL,
    "githubUpdatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "priority" TEXT,
    "customStatus" TEXT,
    "estimatedTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "milestoneId" TEXT,

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labels" (
    "id" TEXT NOT NULL,
    "githubId" INTEGER,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "description" TEXT,
    "repositoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_labels" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,

    CONSTRAINT "issue_labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_assignees" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "issue_assignees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" TEXT NOT NULL,
    "githubId" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "state" TEXT NOT NULL,
    "dueOn" TIMESTAMP(3),
    "repositoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "githubId" INTEGER,
    "body" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "userId" TEXT,
    "githubCreatedAt" TIMESTAMP(3),
    "githubUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_categories" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "issue_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "message" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_views" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entries" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "description" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_githubId_key" ON "users"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "users_githubLogin_key" ON "users"("githubLogin");

-- CreateIndex
CREATE UNIQUE INDEX "repositories_githubId_key" ON "repositories"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "repositories_fullName_key" ON "repositories"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "user_repositories_userId_repositoryId_key" ON "user_repositories"("userId", "repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "issues_githubId_key" ON "issues"("githubId");

-- CreateIndex
CREATE INDEX "issues_state_idx" ON "issues"("state");

-- CreateIndex
CREATE INDEX "issues_priority_idx" ON "issues"("priority");

-- CreateIndex
CREATE INDEX "issues_repositoryId_idx" ON "issues"("repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "issues_repositoryId_number_key" ON "issues"("repositoryId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "labels_githubId_key" ON "labels"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "labels_repositoryId_name_key" ON "labels"("repositoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "issue_labels_issueId_labelId_key" ON "issue_labels"("issueId", "labelId");

-- CreateIndex
CREATE UNIQUE INDEX "issue_assignees_issueId_userId_key" ON "issue_assignees"("issueId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "milestones_githubId_key" ON "milestones"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "comments_githubId_key" ON "comments"("githubId");

-- CreateIndex
CREATE INDEX "comments_issueId_idx" ON "comments"("issueId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_userId_name_key" ON "categories"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "issue_categories_issueId_categoryId_key" ON "issue_categories"("issueId", "categoryId");

-- CreateIndex
CREATE INDEX "reminders_remindAt_isCompleted_idx" ON "reminders"("remindAt", "isCompleted");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_teamId_userId_key" ON "team_members"("teamId", "userId");

-- AddForeignKey
ALTER TABLE "user_repositories" ADD CONSTRAINT "user_repositories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_repositories" ADD CONSTRAINT "user_repositories_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "milestones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labels" ADD CONSTRAINT "labels_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_labels" ADD CONSTRAINT "issue_labels_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_labels" ADD CONSTRAINT "issue_labels_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "labels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_assignees" ADD CONSTRAINT "issue_assignees_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_categories" ADD CONSTRAINT "issue_categories_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_categories" ADD CONSTRAINT "issue_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_views" ADD CONSTRAINT "saved_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
