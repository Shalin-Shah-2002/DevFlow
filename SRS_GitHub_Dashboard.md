# Software Requirements Specification (SRS)
## GitHub Project Dashboard - "DevFlow"

**Version:** 1.0  
**Date:** February 13, 2026  
**Project Type:** SaaS Platform

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for **DevFlow**, a comprehensive GitHub Project Dashboard that aggregates and manages GitHub issues across multiple repositories in a unified interface.

### 1.2 Scope
DevFlow is a cross-platform SaaS application that provides:
- **Web Application** (React)
- **Mobile Application** (Flutter - iOS & Android)
- **RESTful API Backend** (Node.js)

The system allows users to authenticate with GitHub, manage multiple repositories, view/create/edit issues, categorize them with custom workflows, and gain insights through analytics dashboards.

### 1.3 Definitions and Acronyms
- **SaaS**: Software as a Service
- **OAuth**: Open Authorization
- **API**: Application Programming Interface
- **CRUD**: Create, Read, Update, Delete
- **JWT**: JSON Web Token
- **REST**: Representational State Transfer

---

## 2. System Overview

### 2.1 Product Perspective
DevFlow is a standalone web and mobile application that integrates with GitHub's API to provide enhanced project management capabilities beyond GitHub's native interface.

### 2.2 Product Features (High-Level)
1. Multi-repository GitHub integration
2. Unified issue management dashboard
3. Custom categorization and workflows
4. Real-time synchronization
5. Analytics and insights
6. Cross-platform accessibility (Web + Mobile)
7. Team collaboration features
8. Smart notifications and reminders

### 2.3 User Classes and Characteristics

| User Role | Description | Technical Expertise |
|-----------|-------------|---------------------|
| **Individual Developer** | Solo developers managing personal projects | Medium |
| **Team Lead** | Manages team projects and assigns tasks | Medium-High |
| **Project Manager** | Oversees multiple projects and teams | Low-Medium |
| **Contributor** | Team member working on assigned issues | Low-Medium |
| **Viewer** | Read-only access to project status | Low |

---

## 3. Technology Stack

### 3.1 Frontend

#### 3.1.1 Web Application
- **Framework:** React 18+
- **Language:** TypeScript
- **State Management:** Redux Toolkit / Zustand
- **UI Framework:** Material-UI (MUI) / Ant Design / Tailwind CSS + shadcn/ui
- **Routing:** React Router v6
- **HTTP Client:** Axios / React Query
- **Drag & Drop:** react-beautiful-dnd / dnd-kit
- **Charts:** Recharts / Chart.js
- **Build Tool:** Vite / Webpack

#### 3.1.2 Mobile Application
- **Framework:** Flutter 3.x
- **Language:** Dart
- **State Management:** Riverpod / Bloc
- **HTTP Client:** Dio
- **Local Storage:** Hive / Sqflite
- **Navigation:** Go Router / Auto Route
- **UI Components:** Material Design 3
- **Platform:** iOS & Android

### 3.2 Backend
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js / Nest.js
- **Language:** TypeScript
- **Authentication:** Passport.js (OAuth 2.0)
- **Validation:** Joi / Zod
- **Documentation:** Swagger / OpenAPI 3.0

### 3.3 Database
- **Primary Database:** PostgreSQL 15+
- **ORM:** Prisma 5+
- **Caching:** Redis (optional for session management)
- **Migration Tool:** Prisma Migrate

### 3.4 DevOps & Infrastructure
- **Web Hosting:** Vercel / AWS / DigitalOcean
- **Database Hosting:** Supabase / Railway / AWS RDS
- **Mobile Deployment:** Play Store, App Store
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry / LogRocket
- **Version Control:** Git (GitHub)

### 3.5 Third-Party Services
- **GitHub API:** REST API v3 / GraphQL API v4
- **Authentication:** GitHub OAuth 2.0
- **Email Service:** SendGrid / Resend / AWS SES
- **Payment Processing:** Stripe (for subscriptions)
- **Webhooks:** GitHub Webhooks for real-time updates

---

## 4. Functional Requirements

### 4.1 User Authentication & Authorization

#### FR-1.1: GitHub OAuth Login
- **Priority:** High
- **Description:** Users must authenticate using their GitHub account via OAuth 2.0
- **Input:** User clicks "Login with GitHub"
- **Process:** 
  - Redirect to GitHub authorization page
  - User grants permissions (read repos, write issues)
  - System receives OAuth token
  - Create/update user in database
- **Output:** User is logged in and redirected to dashboard

#### FR-1.2: Session Management
- **Priority:** High
- **Description:** System maintains secure user sessions using JWT tokens
- **Token Expiry:** 7 days (with refresh token mechanism)
- **Storage:** 
  - Web: httpOnly cookies + localStorage
  - Mobile: Secure storage (Keychain/Keystore)

#### FR-1.3: User Roles
- **Priority:** Medium
- **Roles:** Admin, Member, Viewer
- **Permissions:** 
  - Admin: Full access, manage team, billing
  - Member: CRUD issues, view analytics
  - Viewer: Read-only access

---

### 4.2 Repository Management

#### FR-2.1: Add Repository
- **Priority:** High
- **Description:** Users can add GitHub repositories by URL or search
- **Input:** 
  - GitHub repo URL (e.g., `https://github.com/user/repo`)
  - OR search by repo name
- **Validation:**
  - Verify repo exists via GitHub API
  - Check user has access permissions
  - Prevent duplicate additions
- **Process:**
  - Fetch repo metadata (name, description, stars, language)
  - Store in database with user association
  - Sync all existing issues
- **Output:** Repo added to user's dashboard

#### FR-2.2: Remove Repository
- **Priority:** Medium
- **Description:** Users can remove repositories from their dashboard
- **Confirmation:** Require confirmation dialog
- **Effect:** Removes repo and all associated local data (issues, analytics)

#### FR-2.3: Repository Grouping
- **Priority:** Low
- **Description:** Users can organize repos into custom groups/folders
- **Examples:** "Frontend", "Backend", "Personal", "Work"

#### FR-2.4: Repository Settings
- **Priority:** Medium
- **Features:**
  - Enable/disable webhook sync
  - Set default labels
  - Configure notification preferences per repo

---

### 4.3 Issue Management

#### FR-3.1: View All Issues
- **Priority:** High
- **Description:** Display unified list of issues from all added repositories
- **Views:**
  1. **List View:** Tabular format with columns
  2. **Kanban View:** Drag-and-drop board
  3. **Calendar View:** Issues by due date
- **Data Displayed:**
  - Issue title
  - Repository name
  - Status (Open/Closed)
  - Labels
  - Assignee(s)
  - Priority (custom)
  - Created/Updated date
  - Comments count

#### FR-3.2: Create Issue
- **Priority:** High
- **Description:** Users can create new GitHub issues directly from dashboard
- **Input Fields:**
  - Title (required)
  - Description (Markdown support)
  - Repository (dropdown)
  - Labels (multi-select)
  - Assignees (multi-select from repo collaborators)
  - Milestone
  - Priority (P0-P3)
  - Custom category
- **Process:**
  - Create issue via GitHub API
  - Store in local database with sync
- **Output:** Issue created on GitHub and appears in dashboard

#### FR-3.3: Edit Issue
- **Priority:** High
- **Description:** Users can edit existing issues
- **Editable Fields:** Same as create + Status (open/closed)
- **Sync:** Changes pushed to GitHub API immediately

#### FR-3.4: Delete/Close Issue
- **Priority:** Medium
- **Description:** Users can close issues (archived but not deleted from GitHub)
- **Confirmation:** Required for closing

#### FR-3.5: Bulk Operations
- **Priority:** Medium
- **Description:** Perform actions on multiple issues simultaneously
- **Actions:**
  - Bulk close
  - Bulk label assignment
  - Bulk priority change
  - Bulk move to category

#### FR-3.6: Issue Details View
- **Priority:** High
- **Description:** Detailed view showing:
  - Full description (rendered Markdown)
  - Comment thread
  - Activity timeline
  - Linked PRs
  - Private notes (not synced to GitHub)
  - Time tracking (local feature)

#### FR-3.7: Issue Comments
- **Priority:** High
- **Description:** View and add comments to issues
- **Features:**
  - Markdown editor
  - @mentions (notify users)
  - Reactions/emojis
  - Edit/delete own comments

---

### 4.4 Categorization & Organization

#### FR-4.1: Custom Priority Levels
- **Priority:** High
- **Description:** Assign custom priority levels beyond GitHub labels
- **Levels:** P0 (Critical), P1 (High), P2 (Medium), P3 (Low)
- **Visual:** Color-coded badges

#### FR-4.2: Custom Categories/Tags
- **Priority:** Medium
- **Description:** Create custom categories independent of GitHub labels
- **Examples:** "Urgent", "Client Request", "Tech Debt", "Quick Win"
- **Features:** 
  - Create/edit/delete categories
  - Assign colors
  - Multi-category support per issue

#### FR-4.3: Custom Workflows
- **Priority:** Low
- **Description:** Define custom status workflows
- **Default:** Backlog → To Do → In Progress → Review → Done
- **Customization:** Users can add/remove/rename statuses

#### FR-4.4: Filters & Search
- **Priority:** High
- **Description:** Advanced filtering and search capabilities
- **Filter By:**
  - Repository
  - Status (open/closed)
  - Labels
  - Assignee
  - Priority
  - Category
  - Date range
  - Milestone
- **Search:**
  - Full-text search in title and description
  - Real-time search results
  - Search history

#### FR-4.5: Saved Views
- **Priority:** Medium
- **Description:** Save custom filter combinations
- **Examples:** "My High Priority", "Team Frontend Bugs", "This Week"

---

### 4.5 Dashboard & Analytics

#### FR-5.1: Personal Dashboard
- **Priority:** High
- **Description:** Customizable home screen showing:
  - Issues assigned to user
  - Recent activity
  - Upcoming due dates
  - Quick actions
  - Statistics summary

#### FR-5.2: Analytics Dashboard
- **Priority:** Medium
- **Description:** Visual insights into project health
- **Metrics:**
  - **Issue Velocity:** Issues opened vs closed over time (line chart)
  - **Response Time:** Average time to first comment
  - **Resolution Time:** Average time to close issues
  - **Issue Distribution:** By status, priority, label (pie charts)
  - **Contributor Activity:** Commits and issues by team member
  - **Burn-down Chart:** Progress toward milestone completion
  - **Repository Health Score:** Custom calculation based on issue age, response time

#### FR-5.3: Time Tracking
- **Priority:** Low
- **Description:** Track time spent on issues (local feature, not synced to GitHub)
- **Features:**
  - Start/stop timer
  - Manual time entry
  - Time reports per issue/repo/user

---

### 4.6 Collaboration Features

#### FR-6.1: Team Management
- **Priority:** Medium
- **Description:** Create and manage teams within the application
- **Features:**
  - Invite team members by email
  - Assign roles
  - Share repositories with team
  - Team-only views

#### FR-6.2: Activity Feed
- **Priority:** Medium
- **Description:** Real-time activity stream showing:
  - Issue created/updated/closed
  - Comments added
  - Assignee changes
  - Label changes
- **Filters:** By user, repository, date

#### FR-6.3: Notifications
- **Priority:** High
- **Description:** Smart notification system
- **Channels:**
  - In-app notifications
  - Email notifications
  - Push notifications (mobile)
- **Events:**
  - Assigned to issue
  - Mentioned in comment
  - Issue status changed
  - Due date approaching
  - New issue in watched repo
- **Settings:** Granular control over notification preferences

#### FR-6.4: @Mentions
- **Priority:** Medium
- **Description:** Tag team members in comments
- **Effect:** Triggers notification to mentioned user

---

### 4.7 Additional Features

#### FR-7.1: Private Notes
- **Priority:** Low
- **Description:** Add personal notes to issues (not visible on GitHub)
- **Use Case:** Internal thoughts, reminders, context

#### FR-7.2: Reminders
- **Priority:** Medium
- **Description:** Set custom reminders for issues
- **Input:** Date/time
- **Notification:** Alert at specified time

#### FR-7.3: Templates
- **Priority:** Low
- **Description:** Create reusable issue templates
- **Examples:** "Bug Report", "Feature Request"

#### FR-7.4: Keyboard Shortcuts
- **Priority:** Low
- **Description:** Quick actions via keyboard
- **Examples:**
  - `C` - Create issue
  - `F` - Focus search
  - `ESC` - Close dialog
  - `K` - Toggle Kanban view

#### FR-7.5: Export Data
- **Priority:** Low
- **Description:** Export issues to CSV/PDF/JSON
- **Filters:** Apply current filters to export

#### FR-7.6: Dark Mode
- **Priority:** Medium
- **Description:** Toggle between light and dark themes
- **Persistence:** Save user preference

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

#### NFR-1.1: Response Time
- API endpoints: < 200ms (95th percentile)
- Page load time: < 2 seconds (initial load)
- Issue list rendering: < 500ms for 1000 issues
- Search results: < 300ms

#### NFR-1.2: Scalability
- Support 10,000+ concurrent users
- Handle 100+ repositories per user
- Process 10,000+ issues efficiently
- Database queries optimized with proper indexing

#### NFR-1.3: Availability
- Uptime: 99.5% minimum
- Scheduled maintenance windows: off-peak hours
- Automatic failover for critical services

### 5.2 Security Requirements

#### NFR-2.1: Authentication
- OAuth 2.0 with GitHub (industry standard)
- JWT tokens with expiration
- Refresh token rotation
- HTTPS only (TLS 1.3)

#### NFR-2.2: Authorization
- Role-based access control (RBAC)
- Repository-level permissions
- API rate limiting per user

#### NFR-2.3: Data Protection
- Encrypted data in transit (HTTPS)
- Encrypted sensitive data at rest
- No storage of GitHub passwords
- OAuth tokens encrypted in database
- GDPR compliant (data export, deletion)

#### NFR-2.4: API Security
- CORS configuration
- Request validation (input sanitization)
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF tokens

### 5.3 Usability Requirements

#### NFR-3.1: User Interface
- Intuitive, modern design
- Consistent design language across web and mobile
- Responsive design (mobile, tablet, desktop)
- Accessibility (WCAG 2.1 Level AA)
- Loading states and error messages

#### NFR-3.2: User Experience
- Onboarding tutorial for new users
- Contextual help tooltips
- Undo functionality for critical actions
- Confirmation dialogs for destructive actions
- Optimistic UI updates

#### NFR-3.3: Mobile Experience
- Native feel on iOS and Android
- Offline support (view cached data)
- Pull-to-refresh
- Biometric authentication option

### 5.4 Reliability Requirements

#### NFR-4.1: Error Handling
- Graceful degradation
- User-friendly error messages
- Automatic retry for failed API calls
- Fallback to cached data when offline

#### NFR-4.2: Data Integrity
- Database transactions for critical operations
- Data validation on client and server
- Backup strategy (daily automated backups)
- Data sync conflict resolution

### 5.5 Maintainability Requirements

#### NFR-5.1: Code Quality
- TypeScript for type safety
- ESLint/Prettier for code formatting
- Minimum 70% code coverage (unit tests)
- Documentation (JSDoc for complex functions)

#### NFR-5.2: Architecture
- Modular, component-based design
- Separation of concerns (MVC/MVVM)
- RESTful API design principles
- Prisma schema as single source of truth

---

## 6. Database Schema (Prisma)

### 6.1 Core Models

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============= USER & AUTH =============

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatar        String?
  githubId      Int       @unique
  githubLogin   String    @unique
  accessToken   String    @db.Text // Encrypted
  refreshToken  String?   @db.Text // Encrypted
  tokenExpiry   DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  repositories  UserRepository[]
  issues        Issue[]
  comments      Comment[]
  teams         TeamMember[]
  notes         Note[]
  reminders     Reminder[]
  categories    Category[]
  savedViews    SavedView[]
  notifications Notification[]
  timeEntries   TimeEntry[]
  
  @@map("users")
}

// ============= REPOSITORY =============

model Repository {
  id              String   @id @default(cuid())
  githubId        Int      @unique
  name            String
  fullName        String   @unique // "owner/repo"
  description     String?  @db.Text
  url             String
  owner           String
  isPrivate       Boolean  @default(false)
  language        String?
  stars           Int      @default(0)
  forks           Int      @default(0)
  openIssuesCount Int      @default(0)
  
  webhookId       String?  // GitHub webhook ID
  webhookEnabled  Boolean  @default(false)
  
  lastSyncedAt    DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  users           UserRepository[]
  issues          Issue[]
  labels          Label[]
  milestones      Milestone[]
  
  @@map("repositories")
}

model UserRepository {
  id           String   @id @default(cuid())
  userId       String
  repositoryId String
  role         String   @default("member") // admin, member, viewer
  group        String?  // For custom grouping
  
  createdAt    DateTime @default(now())
  
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  repository   Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  
  @@unique([userId, repositoryId])
  @@map("user_repositories")
}

// ============= ISSUES =============

model Issue {
  id              String    @id @default(cuid())
  githubId        Int       @unique
  number          Int       // Issue number in repo
  title           String
  body            String?   @db.Text
  state           String    // "open", "closed"
  stateReason     String?   // "completed", "not_planned", "reopened"
  
  repositoryId    String
  creatorId       String?
  
  // GitHub metadata
  githubCreatedAt DateTime
  githubUpdatedAt DateTime
  closedAt        DateTime?
  
  // Custom fields
  priority        String?   // P0, P1, P2, P3
  customStatus    String?   // For custom workflows
  estimatedTime   Int?      // in minutes
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  repository      Repository       @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  creator         User?            @relation(fields: [creatorId], references: [id], onDelete: SetNull)
  labels          IssueLabel[]
  assignees       IssueAssignee[]
  comments        Comment[]
  categories      IssueCategory[]
  notes           Note[]
  reminders       Reminder[]
  timeEntries     TimeEntry[]
  milestone       Milestone?       @relation(fields: [milestoneId], references: [id])
  milestoneId     String?
  
  @@unique([repositoryId, number])
  @@index([state])
  @@index([priority])
  @@index([repositoryId])
  @@map("issues")
}

model Label {
  id           String   @id @default(cuid())
  githubId     Int?     @unique
  name         String
  color        String   // Hex color
  description  String?
  repositoryId String
  
  createdAt    DateTime @default(now())
  
  repository   Repository   @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  issues       IssueLabel[]
  
  @@unique([repositoryId, name])
  @@map("labels")
}

model IssueLabel {
  id       String @id @default(cuid())
  issueId  String
  labelId  String
  
  issue    Issue  @relation(fields: [issueId], references: [id], onDelete: Cascade)
  label    Label  @relation(fields: [labelId], references: [id], onDelete: Cascade)
  
  @@unique([issueId, labelId])
  @@map("issue_labels")
}

model IssueAssignee {
  id       String @id @default(cuid())
  issueId  String
  userId   String
  
  issue    Issue  @relation(fields: [issueId], references: [id], onDelete: Cascade)
  
  @@unique([issueId, userId])
  @@map("issue_assignees")
}

model Milestone {
  id              String    @id @default(cuid())
  githubId        Int?      @unique
  title           String
  description     String?   @db.Text
  state           String    // "open", "closed"
  dueOn           DateTime?
  repositoryId    String
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  repository      Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  issues          Issue[]
  
  @@map("milestones")
}

// ============= COMMENTS =============

model Comment {
  id              String   @id @default(cuid())
  githubId        Int?     @unique
  body            String   @db.Text
  issueId         String
  userId          String?
  
  githubCreatedAt DateTime?
  githubUpdatedAt DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  issue           Issue    @relation(fields: [issueId], references: [id], onDelete: Cascade)
  user            User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  @@index([issueId])
  @@map("comments")
}

// ============= CUSTOM FEATURES =============

model Category {
  id          String   @id @default(cuid())
  name        String
  color       String   // Hex color
  userId      String
  
  createdAt   DateTime @default(now())
  
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  issues      IssueCategory[]
  
  @@unique([userId, name])
  @@map("categories")
}

model IssueCategory {
  id         String   @id @default(cuid())
  issueId    String
  categoryId String
  
  issue      Issue    @relation(fields: [issueId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  @@unique([issueId, categoryId])
  @@map("issue_categories")
}

model Note {
  id        String   @id @default(cuid())
  content   String   @db.Text
  issueId   String
  userId    String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  issue     Issue    @relation(fields: [issueId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("notes")
}

model Reminder {
  id          String   @id @default(cuid())
  issueId     String
  userId      String
  remindAt    DateTime
  message     String?
  isCompleted Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  
  issue       Issue    @relation(fields: [issueId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([remindAt, isCompleted])
  @@map("reminders")
}

model SavedView {
  id          String   @id @default(cuid())
  name        String
  filters     Json     // Store filter configuration
  userId      String
  isDefault   Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("saved_views")
}

model Notification {
  id          String   @id @default(cuid())
  userId      String
  type        String   // "mention", "assigned", "status_change", etc.
  title       String
  message     String   @db.Text
  link        String?
  isRead      Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, isRead])
  @@map("notifications")
}

model TimeEntry {
  id          String   @id @default(cuid())
  issueId     String
  userId      String
  duration    Int      // in minutes
  description String?
  startedAt   DateTime
  endedAt     DateTime?
  
  createdAt   DateTime @default(now())
  
  issue       Issue    @relation(fields: [issueId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("time_entries")
}

// ============= TEAMS (Optional) =============

model Team {
  id          String   @id @default(cuid())
  name        String
  description String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  members     TeamMember[]
  
  @@map("teams")
}

model TeamMember {
  id        String   @id @default(cuid())
  teamId    String
  userId    String
  role      String   @default("member") // owner, admin, member
  
  createdAt DateTime @default(now())
  
  team      Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([teamId, userId])
  @@map("team_members")
}
```

---

## 7. API Endpoints

### 7.1 Authentication
```
POST   /api/auth/github           - Initiate GitHub OAuth
GET    /api/auth/github/callback  - OAuth callback
POST   /api/auth/refresh          - Refresh access token
POST   /api/auth/logout           - Logout user
GET    /api/auth/me               - Get current user
```

### 7.2 Repositories
```
GET    /api/repositories                    - Get all user repos
POST   /api/repositories                    - Add repository
GET    /api/repositories/:id                - Get repo details
DELETE /api/repositories/:id                - Remove repository
POST   /api/repositories/:id/sync           - Sync repo issues
PUT    /api/repositories/:id/settings       - Update repo settings
POST   /api/repositories/:id/webhook        - Setup webhook
```

### 7.3 Issues
```
GET    /api/issues                          - Get all issues (with filters)
POST   /api/issues                          - Create issue
GET    /api/issues/:id                      - Get issue details
PUT    /api/issues/:id                      - Update issue
DELETE /api/issues/:id                      - Close issue
POST   /api/issues/bulk                     - Bulk operations
GET    /api/issues/:id/comments             - Get issue comments
POST   /api/issues/:id/comments             - Add comment
PUT    /api/issues/:id/comments/:commentId  - Edit comment
DELETE /api/issues/:id/comments/:commentId  - Delete comment
```

### 7.4 Categories & Tags
```
GET    /api/categories            - Get user categories
POST   /api/categories            - Create category
PUT    /api/categories/:id        - Update category
DELETE /api/categories/:id        - Delete category
POST   /api/issues/:id/categories - Assign categories to issue
```

### 7.5 Filters & Views
```
GET    /api/saved-views           - Get saved views
POST   /api/saved-views           - Create saved view
PUT    /api/saved-views/:id       - Update saved view
DELETE /api/saved-views/:id       - Delete saved view
```

### 7.6 Analytics
```
GET    /api/analytics/velocity         - Issue velocity data
GET    /api/analytics/distribution     - Issue distribution
GET    /api/analytics/response-time    - Average response time
GET    /api/analytics/contributors     - Contributor stats
GET    /api/analytics/burndown/:id     - Milestone burndown
```

### 7.7 Notifications
```
GET    /api/notifications              - Get user notifications
PUT    /api/notifications/:id/read     - Mark as read
PUT    /api/notifications/read-all     - Mark all as read
GET    /api/notifications/settings     - Get notification settings
PUT    /api/notifications/settings     - Update settings
```

### 7.8 Notes & Reminders
```
GET    /api/notes/:issueId             - Get notes for issue
POST   /api/notes                      - Create note
PUT    /api/notes/:id                  - Update note
DELETE /api/notes/:id                  - Delete note

GET    /api/reminders                  - Get user reminders
POST   /api/reminders                  - Create reminder
PUT    /api/reminders/:id              - Update reminder
DELETE /api/reminders/:id              - Delete reminder
```

### 7.9 Time Tracking
```
GET    /api/time-entries               - Get time entries
POST   /api/time-entries               - Create time entry
PUT    /api/time-entries/:id           - Update time entry
DELETE /api/time-entries/:id           - Delete time entry
GET    /api/time-entries/report        - Generate time report
```

### 7.10 Teams (Optional)
```
GET    /api/teams                      - Get user teams
POST   /api/teams                      - Create team
GET    /api/teams/:id                  - Get team details
PUT    /api/teams/:id                  - Update team
DELETE /api/teams/:id                  - Delete team
POST   /api/teams/:id/members          - Add team member
DELETE /api/teams/:id/members/:userId  - Remove team member
```

---

## 8. System Architecture

### 8.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
├──────────────────────┬──────────────────────────────────┤
│   React Web App      │    Flutter Mobile App            │
│   (TypeScript)       │    (Dart)                        │
│   - Redux/Zustand    │    - Riverpod/Bloc               │
│   - React Router     │    - Go Router                   │
│   - Axios/React Query│    - Dio                         │
└──────────┬───────────┴───────────┬──────────────────────┘
           │                       │
           │      HTTPS/REST       │
           │                       │
┌──────────▼───────────────────────▼──────────────────────┐
│                   API Gateway                           │
│              (CORS, Rate Limiting)                      │
└──────────┬──────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────┐
│                Backend Layer (Node.js)                  │
├─────────────────────────────────────────────────────────┤
│  Express.js / Nest.js (TypeScript)                      │
│  ┌──────────────┬──────────────┬──────────────┐         │
│  │ Auth Module  │ Repo Module  │ Issue Module │         │
│  ├──────────────┼──────────────┼──────────────┤         │
│  │ Analytics    │ Notification │ Webhook      │         │
│  │ Module       │ Module       │ Handler      │         │
│  └──────────────┴──────────────┴──────────────┘         │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │         Prisma ORM (Type-safe)             │         │
│  └────────────┬───────────────────────────────┘         │
└───────────────┼──────────────────────────────────────────┘
                │
     ┌──────────▼──────────┬───────────────┐
     │                     │               │
┌────▼─────┐      ┌────────▼──────┐   ┌───▼──────┐
│PostgreSQL│      │ GitHub API    │   │ Redis    │
│ Database │      │ (REST/GraphQL)│   │ (Cache)  │
│          │      │               │   │          │
│ - Users  │      │ - OAuth       │   │- Sessions│
│ - Issues │      │ - Issues      │   │- Queues  │
│ - Repos  │      │ - Webhooks    │   │          │
└──────────┘      └───────────────┘   └──────────┘

         ┌────────────────────────┐
         │  External Services     │
         ├────────────────────────┤
         │ - SendGrid (Email)     │
         │ - Stripe (Payments)    │
         │ - Sentry (Monitoring)  │
         └────────────────────────┘
```

### 8.2 Data Flow

#### 8.2.1 Issue Creation Flow
```
1. User (Web/Mobile) → Submit issue form
2. Client → Validate input
3. Client → POST /api/issues
4. Backend → Validate with Zod/Joi
5. Backend → GitHub API: Create issue
6. Backend → Prisma: Store in database
7. Backend → Emit webhook event
8. Backend → Response to client
9. Client → Update UI optimistically
10. Webhook → Sync status (if enabled)
```

#### 8.2.2 OAuth Authentication Flow
```
1. User → Click "Login with GitHub"
2. Client → Redirect to GitHub OAuth
3. GitHub → User grants permissions
4. GitHub → Callback with auth code
5. Backend → Exchange code for access token
6. Backend → Fetch user profile from GitHub
7. Backend → Create/update user in database
8. Backend → Generate JWT token
9. Backend → Response with JWT
10. Client → Store JWT securely
11. Client → Redirect to dashboard
```

#### 8.2.3 Real-time Sync Flow
```
1. GitHub → Issue updated (external)
2. GitHub → Webhook to /api/webhooks/github
3. Backend → Verify webhook signature
4. Backend → Process webhook payload
5. Backend → Update database via Prisma
6. Backend → Emit WebSocket event (optional)
7. Client → Receive update via polling/WebSocket
8. Client → Update UI
```

---

## 9. User Stories

### 9.1 Epic 1: Authentication
- **US-1.1:** As a user, I want to login with my GitHub account so that I can access the dashboard securely.
- **US-1.2:** As a user, I want to stay logged in for 7 days so that I don't have to re-authenticate frequently.

### 9.2 Epic 2: Repository Management
- **US-2.1:** As a developer, I want to add multiple GitHub repositories by URL so that I can manage all my projects in one place.
- **US-2.2:** As a user, I want to organize my repositories into groups (Frontend, Backend) so that I can quickly navigate to related projects.
- **US-2.3:** As a user, I want to remove repositories I no longer need so that my dashboard stays clean.

### 9.3 Epic 3: Issue Viewing
- **US-3.1:** As a user, I want to see all issues from my repositories in a single list so that I have a unified view.
- **US-3.2:** As a developer, I want to switch between List, Kanban, and Calendar views so that I can visualize issues in different ways.
- **US-3.3:** As a user, I want to filter issues by status, label, assignee, and priority so that I can find relevant issues quickly.
- **US-3.4:** As a user, I want to search issues by title and description so that I can locate specific issues.

### 9.4 Epic 4: Issue Management
- **US-4.1:** As a developer, I want to create new issues directly from the dashboard so that I don't have to go to GitHub.
- **US-4.2:** As a user, I want to edit issue details (title, description, labels) so that I can keep information up-to-date.
- **US-4.3:** As a team lead, I want to assign issues to team members so that work is distributed clearly.
- **US-4.4:** As a user, I want to close multiple issues at once so that I can perform bulk actions efficiently.
- **US-4.5:** As a developer, I want to add comments to issues so that I can collaborate with my team.

### 9.5 Epic 5: Custom Organization
- **US-5.1:** As a project manager, I want to assign custom priority levels (P0-P3) to issues so that I can prioritize work.
- **US-5.2:** As a user, I want to create custom categories (Urgent, Tech Debt) so that I can organize issues beyond GitHub labels.
- **US-5.3:** As a user, I want to save my frequently-used filters as views so that I can quickly access them.

### 9.6 Epic 6: Analytics
- **US-6.1:** As a team lead, I want to see issue velocity charts so that I can track team productivity.
- **US-6.2:** As a project manager, I want to view issue distribution by status and priority so that I can understand project health.
- **US-6.3:** As a manager, I want to see contributor activity so that I can recognize team contributions.

### 9.7 Epic 7: Collaboration
- **US-7.1:** As a team member, I want to receive notifications when I'm assigned to an issue so that I stay informed.
- **US-7.2:** As a user, I want to @mention teammates in comments so that I can get their attention.
- **US-7.3:** As a viewer, I want to see an activity feed showing recent changes so that I can stay updated.

### 9.8 Epic 8: Mobile Experience
- **US-8.1:** As a mobile user, I want to view and manage issues on my phone so that I can work on the go.
- **US-8.2:** As a mobile user, I want to receive push notifications for important updates so that I never miss critical issues.
- **US-8.3:** As a mobile user, I want to view cached data offline so that I can access information without internet.

---

## 10. Implementation Phases

### Phase 1: MVP (Weeks 1-3) ✅
**Goal:** Core functionality for single-user issue management

#### Week 1: Setup & Auth
- [ ] Project setup (React, Node.js, PostgreSQL, Prisma)
- [ ] GitHub OAuth implementation
- [ ] Database schema creation
- [ ] Basic user authentication flow
- [ ] Protected API routes

#### Week 2: Repository & Issue Core
- [ ] Add/remove repositories
- [ ] Fetch issues from GitHub API
- [ ] Display issues in list view
- [ ] Create new issue
- [ ] Edit/close issue
- [ ] Basic filtering (status, labels)

#### Week 3: UI Polish & Search
- [ ] Responsive dashboard layout
- [ ] Search functionality
- [ ] Issue details modal/page
- [ ] Loading states and error handling
- [ ] Dark mode toggle
- [ ] Deploy to Vercel/Railway

**Deliverable:** Functional web app for personal use

---

### Phase 2: Enhanced Features (Weeks 4-6)
**Goal:** Advanced organization and productivity features

#### Week 4: Categorization
- [ ] Custom priority levels (P0-P3)
- [ ] Custom categories creation
- [ ] Assign categories to issues
- [ ] Saved filters/views
- [ ] Kanban board view

#### Week 5: Collaboration
- [ ] Comments on issues
- [ ] @mentions support
- [ ] Activity feed
- [ ] Notification system (in-app)
- [ ] Email notifications setup

#### Week 6: Analytics
- [ ] Issue velocity chart
- [ ] Distribution charts (status, priority, labels)
- [ ] Response time metrics
- [ ] Repository health score
- [ ] Analytics dashboard page

**Deliverable:** Feature-rich web app with team collaboration

---

### Phase 3: Mobile App (Weeks 7-9)
**Goal:** Cross-platform mobile experience

#### Week 7: Flutter Setup
- [ ] Flutter project initialization
- [ ] Authentication flow (GitHub OAuth)
- [ ] State management setup (Riverpod/Bloc)
- [ ] API integration layer

#### Week 8: Core Mobile Features
- [ ] Repository list screen
- [ ] Issues list screen
- [ ] Issue details screen
- [ ] Create/edit issue forms
- [ ] Filters and search
- [ ] Offline caching

#### Week 9: Mobile-Specific Features
- [ ] Push notifications
- [ ] Biometric authentication
- [ ] Pull-to-refresh
- [ ] Dark mode
- [ ] App store assets
- [ ] Beta testing (TestFlight, Play Console)

**Deliverable:** Mobile apps on iOS and Android

---

### Phase 4: Advanced & SaaS (Weeks 10-12)
**Goal:** Production-ready SaaS platform

#### Week 10: Real-time & Webhooks
- [ ] GitHub webhook integration
- [ ] Real-time sync without polling
- [ ] WebSocket for live updates (optional)
- [ ] Improved webhook security

#### Week 11: Teams & Billing
- [ ] Team creation and management
- [ ] Team member invitations
- [ ] Role-based permissions
- [ ] Stripe integration (subscriptions)
- [ ] Pricing tiers (Free, Pro, Team)

#### Week 12: Polish & Launch
- [ ] Time tracking feature
- [ ] Reminders and due dates
- [ ] Private notes
- [ ] Export data (CSV/PDF)
- [ ] Landing page
- [ ] Documentation
- [ ] Performance optimization
- [ ] Security audit
- [ ] Public launch 🚀

**Deliverable:** Full SaaS platform ready for users

---

### Phase 5: Growth Features (Post-Launch)
**Optional/Future Enhancements:**
- [ ] AI-powered features (duplicate detection, priority prediction)
- [ ] Slack/Discord integrations
- [ ] PR tracking alongside issues
- [ ] Custom dashboards (widgets)
- [ ] API for third-party integrations
- [ ] Browser extension
- [ ] Multi-organization support
- [ ] Advanced reporting
- [ ] Webhooks for external systems
- [ ] White-label option

---

## 11. Testing Strategy

### 11.1 Unit Testing
- **Backend:** Jest + Supertest
  - Test all API endpoints
  - Test Prisma queries
  - Test utility functions
  - Target: 70%+ code coverage

- **Frontend (React):** Jest + React Testing Library
  - Component unit tests
  - Hook tests
  - Reducer/state tests

- **Mobile (Flutter):** Flutter Test
  - Widget tests
  - Unit tests for business logic
  - Mock API responses

### 11.2 Integration Testing
- Test API + Database interactions
- Test GitHub API integration
- Test OAuth flow end-to-end
- Test webhook processing

### 11.3 End-to-End Testing
- **Web:** Playwright / Cypress
  - Critical user flows (login, create issue, etc.)
  - Run on CI/CD pipeline

- **Mobile:** Flutter Integration Tests
  - Key workflows on emulators

### 11.4 Manual Testing
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile device testing (iOS and Android)
- Accessibility testing
- Security testing (OWASP checklist)

---

## 12. Deployment Strategy

### 12.1 Web Application
- **Platform:** Vercel / Netlify / AWS Amplify
- **Environment Variables:** 
  - `DATABASE_URL`
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
  - `JWT_SECRET`
  - `STRIPE_SECRET_KEY` (if applicable)
- **CI/CD:** GitHub Actions
  - Run tests on PR
  - Auto-deploy on merge to main
  - Staging environment for preview

### 12.2 Backend API
- **Platform:** Railway / Render / DigitalOcean / AWS EC2
- **Database:** Supabase / Railway / AWS RDS (PostgreSQL)
- **Migrations:** Prisma Migrate
- **Monitoring:** Sentry, Datadog, or New Relic

### 12.3 Mobile Apps
- **iOS:** TestFlight (beta) → App Store
- **Android:** Internal Testing → Closed Beta → Production (Play Store)
- **CI/CD:** Codemagic / Bitrise / GitHub Actions
  - Automated builds on tag push
  - Fastlane for deployment automation

### 12.4 Environment Strategy
- **Development:** Local (localhost)
- **Staging:** Preview deployments (test.devflow.app)
- **Production:** Live app (devflow.app)

---

## 13. Risk Management

### 13.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| GitHub API rate limiting | High | Cache data, implement webhooks, use GraphQL |
| OAuth token expiration | Medium | Implement refresh token mechanism |
| Database performance with large datasets | High | Optimize queries, add indexes, implement pagination |
| Real-time sync conflicts | Medium | Implement conflict resolution strategy |
| Third-party service downtime (GitHub) | High | Graceful degradation, offline mode |

### 13.2 Business Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| User adoption | High | Focus on clear value proposition, free tier |
| Competition from existing tools | Medium | Differentiate with unique features (analytics, cross-platform) |
| GitHub API ToS changes | Medium | Comply with ToS, stay updated on policy changes |
| Scaling costs | Medium | Optimize infrastructure, tiered pricing |

---

## 14. Success Metrics (KPIs)

### 14.1 Product Metrics
- **User Acquisition:**
  - Signups per month
  - Activation rate (users who add ≥1 repo)
  - Retention rate (30-day, 90-day)

- **Engagement:**
  - Daily active users (DAU)
  - Monthly active users (MAU)
  - Issues created per user
  - Average session duration
  - Feature adoption rates

- **Performance:**
  - API response time (p95)
  - Page load time
  - Crash-free rate (mobile)
  - Uptime percentage

### 14.2 Business Metrics (If Monetized)
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn rate
- Conversion rate (free → paid)

---

## 15. Future Considerations

### 15.1 Scalability
- Implement caching layer (Redis)
- Database read replicas
- CDN for static assets
- Horizontal scaling for API servers

### 15.2 Internationalization
- Multi-language support (i18n)
- Localized date/time formats
- Currency support for billing

### 15.3 Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode

### 15.4 Compliance
- GDPR compliance (data export, right to be forgotten)
- CCPA compliance
- SOC 2 Type II (for enterprise customers)

---

## 16. Glossary

| Term | Definition |
|------|------------|
| **Issue** | A GitHub issue (bug, feature request, task) |
| **Repository** | A GitHub code repository (project) |
| **Label** | GitHub's categorization system for issues |
| **Milestone** | GitHub's project milestone (version, sprint) |
| **Webhook** | Automated message sent when GitHub event occurs |
| **OAuth** | Industry-standard authorization protocol |
| **Prisma** | Next-generation ORM for Node.js and TypeScript |
| **JWT** | JSON Web Token for authentication |

---

## 17. Appendices

### Appendix A: GitHub API Endpoints Used
- `/user` - Get authenticated user
- `/user/repos` - Get user repositories
- `/repos/{owner}/{repo}/issues` - List issues
- `/repos/{owner}/{repo}/issues` (POST) - Create issue
- `/repos/{owner}/{repo}/issues/{number}` (PATCH) - Update issue
- `/repos/{owner}/{repo}/issues/{number}/comments` - Issue comments
- `/repos/{owner}/{repo}/hooks` - Webhooks

### Appendix B: References
- GitHub REST API: https://docs.github.com/en/rest
- GitHub OAuth: https://docs.github.com/en/apps/oauth-apps
- Prisma Documentation: https://www.prisma.io/docs
- React Documentation: https://react.dev
- Flutter Documentation: https://flutter.dev

---

**Document Status:** Draft v1.0  
**Next Review:** After team feedback  
**Approval Required:** Product Owner, Tech Lead

---

## Contact & Contributions
For questions or suggestions regarding this SRS, please contact the project maintainer.
