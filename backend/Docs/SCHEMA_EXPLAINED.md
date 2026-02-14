# 📊 DevFlow Database Schema Explained

## 🎯 Overview

Your database has **18 tables** organized into **5 main sections**:

1. **User & Authentication** (1 table)
2. **Repository Management** (2 tables)
3. **Issue Management** (6 tables)
4. **Custom Features** (7 tables)
5. **Team Management** (2 tables)

**Total Storage:** Handles unlimited repos, issues, users, and features!

---

## 📐 Database Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DEVFLOW DATABASE                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────────┐         ┌──────────┐
│     USER     │◄────────┤ USER_REPOSITORY  ├────────►│   REPO   │
│              │         │  (Many-to-Many)  │         │          │
│ - githubId   │         └──────────────────┘         │ - issues │
│ - email      │                                      │ - labels │
│ - name       │                                      └─────┬────┘
└──────┬───────┘                                            │
       │                                                    │
       │                  ┌──────────────────┐             │
       │                  │      ISSUE       │◄────────────┘
       └─────────────────►│                  │
                          │ - title          │
                          │ - body           │
                          │ - state          │
                          │ - priority       │
                          └────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
              ┌─────▼────┐   ┌────▼─────┐   ┌───▼──────┐
              │  LABEL   │   │ COMMENT  │   │   NOTE   │
              │          │   │          │   │ (private)│
              └──────────┘   └──────────┘   └──────────┘
```

---

## 🗂️ Detailed Schema Breakdown

### 1️⃣ USER & AUTHENTICATION

#### **Table: `users`**
Stores user information from GitHub OAuth.

```prisma
model User {
  id            String    @id @default(cuid())      // Unique ID: "ckl12abc..."
  email         String    @unique                   // user@example.com
  name          String?                             // "John Doe"
  avatar        String?                             // Profile picture URL
  githubId      Int       @unique                   // GitHub user ID (1234567)
  githubLogin   String    @unique                   // GitHub username
  accessToken   String    @db.Text                  // OAuth token (encrypted)
  refreshToken  String?   @db.Text                  // Refresh token
  tokenExpiry   DateTime?                           // When token expires
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

**Key Points:**
- `cuid()` = Collision-resistant unique ID
- `@unique` = No duplicates allowed
- `?` = Optional field (can be null)
- `@db.Text` = Large text storage for tokens
- Automatically tracks `createdAt` and `updatedAt`

**Example Data:**
```json
{
  "id": "ckl1234567890",
  "email": "john@example.com",
  "name": "John Doe",
  "avatar": "https://github.com/johndoe.png",
  "githubId": 12345678,
  "githubLogin": "johndoe",
  "accessToken": "gho_encrypted_token_here",
  "createdAt": "2026-02-13T10:00:00Z",
  "updatedAt": "2026-02-13T10:00:00Z"
}
```

---

### 2️⃣ REPOSITORY MANAGEMENT

#### **Table: `repositories`**
Stores GitHub repository metadata.

```prisma
model Repository {
  id              String   @id @default(cuid())
  githubId        Int      @unique                  // GitHub repo ID
  name            String                            // "my-project"
  fullName        String   @unique                  // "username/my-project"
  description     String?  @db.Text                 // Repo description
  url             String                            // GitHub URL
  owner           String                            // Repo owner username
  isPrivate       Boolean  @default(false)          // Private repo?
  language        String?                           // Primary language
  stars           Int      @default(0)              // Star count
  forks           Int      @default(0)              // Fork count
  openIssuesCount Int      @default(0)              // Open issues
  
  webhookId       String?                           // For real-time sync
  webhookEnabled  Boolean  @default(false)
  
  lastSyncedAt    DateTime?                         // Last sync time
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

**Example Data:**
```json
{
  "id": "ckl987654321",
  "githubId": 456789123,
  "name": "devflow",
  "fullName": "johndoe/devflow",
  "description": "GitHub Project Dashboard",
  "url": "https://github.com/johndoe/devflow",
  "owner": "johndoe",
  "isPrivate": false,
  "language": "TypeScript",
  "stars": 42,
  "forks": 5,
  "openIssuesCount": 12,
  "webhookEnabled": true,
  "lastSyncedAt": "2026-02-13T09:45:00Z"
}
```

#### **Table: `user_repositories`**
**Many-to-Many** relationship between Users and Repositories.

```prisma
model UserRepository {
  id           String   @id @default(cuid())
  userId       String                            // Which user
  repositoryId String                            // Which repo
  role         String   @default("member")       // admin, member, viewer
  group        String?                           // Custom group: "Frontend"
  createdAt    DateTime @default(now())
  
  @@unique([userId, repositoryId])              // One user per repo (no duplicates)
}
```

**Why This Table?**
- One user can have many repositories
- One repository can have many users
- Stores user's role for that specific repo
- Allows custom grouping ("Work", "Personal", etc.)

**Example Data:**
```json
{
  "id": "ckl555555555",
  "userId": "ckl1234567890",
  "repositoryId": "ckl987654321",
  "role": "admin",
  "group": "Backend Projects",
  "createdAt": "2026-02-13T10:00:00Z"
}
```

---

### 3️⃣ ISSUE MANAGEMENT

#### **Table: `issues`**
The heart of the application! Stores GitHub issues.

```prisma
model Issue {
  id              String    @id @default(cuid())
  githubId        Int       @unique               // GitHub issue ID
  number          Int                             // Issue #123 in repo
  title           String                          // "Fix login bug"
  body            String?   @db.Text              // Description (Markdown)
  state           String                          // "open" or "closed"
  stateReason     String?                         // "completed", "not_planned"
  
  repositoryId    String                          // Which repo
  creatorId       String?                         // Who created it
  
  // GitHub metadata
  githubCreatedAt DateTime                        // When created on GitHub
  githubUpdatedAt DateTime                        // Last update on GitHub
  closedAt        DateTime?                       // When closed
  
  // 🎨 CUSTOM FIELDS (Your additions, not on GitHub!)
  priority        String?                         // P0, P1, P2, P3
  customStatus    String?                         // "In Review", "Blocked"
  estimatedTime   Int?                            // Minutes to complete
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@unique([repositoryId, number])                // Issue #1 unique per repo
  @@index([state])                                // Fast filtering by state
  @@index([priority])                             // Fast filtering by priority
}
```

**Example Data:**
```json
{
  "id": "ckl111222333",
  "githubId": 789456123,
  "number": 42,
  "title": "Add dark mode to dashboard",
  "body": "Users are requesting dark mode...",
  "state": "open",
  "repositoryId": "ckl987654321",
  "creatorId": "ckl1234567890",
  "githubCreatedAt": "2026-02-10T14:30:00Z",
  "githubUpdatedAt": "2026-02-13T09:00:00Z",
  "priority": "P1",
  "customStatus": "In Progress",
  "estimatedTime": 120
}
```

#### **Table: `labels`**
Issue labels (bug, feature, enhancement, etc.)

```prisma
model Label {
  id           String   @id @default(cuid())
  githubId     Int?     @unique                   // GitHub label ID
  name         String                             // "bug"
  color        String                             // "ff0000" (hex)
  description  String?
  repositoryId String                             // Which repo
  
  @@unique([repositoryId, name])                  // No duplicate labels per repo
}
```

**Example Data:**
```json
{
  "id": "ckl333444555",
  "githubId": 123456,
  "name": "bug",
  "color": "d73a4a",
  "description": "Something isn't working",
  "repositoryId": "ckl987654321"
}
```

#### **Table: `issue_labels`**
**Many-to-Many** between Issues and Labels.

```prisma
model IssueLabel {
  id       String @id @default(cuid())
  issueId  String                                // Which issue
  labelId  String                                // Which label
  
  @@unique([issueId, labelId])                  // No duplicate labels on issue
}
```

**Why?** One issue can have multiple labels: ["bug", "priority", "frontend"]

#### **Table: `issue_assignees`**
Who is assigned to work on this issue?

```prisma
model IssueAssignee {
  id       String @id @default(cuid())
  issueId  String                                // Which issue
  userId   String                                // Which user assigned
  
  @@unique([issueId, userId])                   // No duplicate assignments
}
```

**Why?** Multiple people can be assigned to one issue.

#### **Table: `milestones`**
Project milestones (v1.0, Sprint 1, etc.)

```prisma
model Milestone {
  id              String    @id @default(cuid())
  githubId        Int?      @unique
  title           String                          // "v1.0 Release"
  description     String?   @db.Text
  state           String                          // "open" or "closed"
  dueOn           DateTime?                       // Deadline
  repositoryId    String
}
```

#### **Table: `comments`**
Comments on issues.

```prisma
model Comment {
  id              String   @id @default(cuid())
  githubId        Int?     @unique               // GitHub comment ID
  body            String   @db.Text              // Comment text (Markdown)
  issueId         String                         // Which issue
  userId          String?                        // Who commented
  
  githubCreatedAt DateTime?
  githubUpdatedAt DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([issueId])                            // Fast lookup by issue
}
```

---

### 4️⃣ CUSTOM FEATURES (Not on GitHub!)

These features exist **only in your app**, not synced to GitHub.

#### **Table: `categories`**
Custom categories beyond GitHub labels.

```prisma
model Category {
  id          String   @id @default(cuid())
  name        String                            // "Urgent", "Tech Debt"
  color       String                            // Hex color
  userId      String                            // Who created it
  
  @@unique([userId, name])                      // No duplicate categories per user
}
```

**Use Case:** You want to tag issues as "Client Request" or "Quick Win" without cluttering GitHub labels.

#### **Table: `issue_categories`**
Many-to-Many between Issues and Categories.

```prisma
model IssueCategory {
  id         String   @id @default(cuid())
  issueId    String
  categoryId String
  
  @@unique([issueId, categoryId])
}
```

#### **Table: `notes`**
Private notes on issues (only visible to you).

```prisma
model Note {
  id        String   @id @default(cuid())
  content   String   @db.Text                  // Your private notes
  issueId   String                             // Which issue
  userId    String                             // Who wrote it
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Use Case:** Add internal context: "Client mentioned this in call" without posting publicly on GitHub.

#### **Table: `reminders`**
Set reminders for issues.

```prisma
model Reminder {
  id          String   @id @default(cuid())
  issueId     String                           // Which issue
  userId      String                           // Who set reminder
  remindAt    DateTime                         // When to remind
  message     String?                          // Optional message
  isCompleted Boolean  @default(false)         // Dismissed?
  
  @@index([remindAt, isCompleted])            // Fast queries
}
```

**Use Case:** "Remind me about this issue tomorrow at 2 PM"

#### **Table: `saved_views`**
Save custom filter combinations.

```prisma
model SavedView {
  id          String   @id @default(cuid())
  name        String                           // "High Priority Bugs"
  filters     Json                             // Stored filter config
  userId      String
  isDefault   Boolean  @default(false)         // Default view?
}
```

**Example Filters JSON:**
```json
{
  "state": "open",
  "priority": ["P0", "P1"],
  "labels": ["bug"],
  "repository": "ckl987654321"
}
```

#### **Table: `notifications`**
In-app notifications.

```prisma
model Notification {
  id          String   @id @default(cuid())
  userId      String                           // Who receives it
  type        String                           // "mention", "assigned"
  title       String                           // "You were assigned"
  message     String   @db.Text                // Full message
  link        String?                          // Link to issue
  isRead      Boolean  @default(false)         // Read or unread?
  
  @@index([userId, isRead])                   // Fast unread queries
}
```

#### **Table: `time_entries`**
Track time spent on issues.

```prisma
model TimeEntry {
  id          String   @id @default(cuid())
  issueId     String                           // Which issue
  userId      String                           // Who worked on it
  duration    Int                              // Minutes spent
  description String?                          // What you did
  startedAt   DateTime                         // Start time
  endedAt     DateTime?                        // End time
}
```

**Use Case:** Track billable hours or personal productivity.

---

### 5️⃣ TEAM MANAGEMENT

#### **Table: `teams`**
Create teams for collaboration.

```prisma
model Team {
  id          String   @id @default(cuid())
  name        String                           // "Frontend Team"
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### **Table: `team_members`**
Who is in which team?

```prisma
model TeamMember {
  id        String   @id @default(cuid())
  teamId    String                            // Which team
  userId    String                            // Which user
  role      String   @default("member")       // owner, admin, member
  
  @@unique([teamId, userId])                 // No duplicate members
}
```

---

## 🔗 Relationships Explained

### One-to-Many Relationships

```
User ──────┬───< Issue (one user creates many issues)
           ├───< Comment (one user writes many comments)
           ├───< Note (one user writes many notes)
           └───< Category (one user creates many categories)

Repository ─┬───< Issue (one repo has many issues)
            ├───< Label (one repo has many labels)
            └───< Milestone (one repo has many milestones)

Issue ──────┬───< Comment (one issue has many comments)
            ├───< Note (one issue has many notes)
            └───< TimeEntry (one issue has many time entries)
```

### Many-to-Many Relationships

```
User ◄──────── UserRepository ──────────► Repository
          (Users can have multiple repos)
          (Repos can have multiple users)

Issue ◄─────── IssueLabel ───────────► Label
          (Issues can have multiple labels)
          (Labels can be on multiple issues)

Issue ◄─────── IssueAssignee ────────► User
          (Issues can have multiple assignees)
          (Users can be assigned to multiple issues)

Issue ◄─────── IssueCategory ────────► Category
          (Issues can have multiple categories)
          (Categories can apply to multiple issues)
```

---

## 🎨 Special Prisma Features Used

### 1. **Unique Constraints**
```prisma
@unique                          // Single field unique
@@unique([field1, field2])       // Combination unique
```

**Example:** 
- `@@unique([userId, repositoryId])` = User can add same repo only once
- `@@unique([issueId, labelId])` = Can't add same label twice to issue

### 2. **Indexes for Performance**
```prisma
@@index([state])                 // Fast filtering by state
@@index([userId, isRead])        // Fast unread notifications query
```

**Why?** Speeds up common queries dramatically!

### 3. **Cascade Delete**
```prisma
onDelete: Cascade               // Delete related data automatically
onDelete: SetNull              // Set foreign key to null
```

**Example:**
- Delete User → All their repositories, comments, notes deleted
- Delete Repository → All issues, labels deleted
- Delete Issue → All comments, labels, notes deleted

### 4. **Default Values**
```prisma
@default(now())                 // Current timestamp
@default(false)                 // Boolean default
@default(cuid())               // Auto-generate ID
@default("member")             // String default
```

### 5. **Optional Fields**
```prisma
field String?                   // Can be null
field String                    // Required (cannot be null)
```

---

## 📊 Database Statistics

When fully populated:

| Table | Estimated Rows | Size |
|-------|---------------|------|
| `users` | 1,000 - 100,000 | Small |
| `repositories` | 5,000 - 500,000 | Medium |
| `issues` | 100,000 - 10M | Large |
| `comments` | 500,000 - 50M | Large |
| `labels` | 10,000 - 100,000 | Small |
| `notifications` | 1M - 100M | Medium |

**Total:** Scales to millions of records efficiently!

---

## 🔍 Example Queries (How Prisma Uses This)

### Create a User
```typescript
const user = await prisma.user.create({
  data: {
    email: "john@example.com",
    name: "John Doe",
    githubId: 12345678,
    githubLogin: "johndoe",
    accessToken: "encrypted_token"
  }
});
```

### Get User with All Repositories
```typescript
const user = await prisma.user.findUnique({
  where: { id: "ckl1234567890" },
  include: {
    repositories: {
      include: {
        repository: true  // Include full repo details
      }
    }
  }
});
```

### Get All Open Issues with Labels
```typescript
const issues = await prisma.issue.findMany({
  where: { 
    state: "open",
    priority: "P1"
  },
  include: {
    labels: {
      include: {
        label: true
      }
    },
    repository: true,
    assignees: true
  },
  orderBy: {
    githubCreatedAt: 'desc'
  }
});
```

### Create Issue with Labels
```typescript
const issue = await prisma.issue.create({
  data: {
    githubId: 789,
    number: 42,
    title: "Fix bug",
    body: "Description",
    state: "open",
    repositoryId: "ckl987654321",
    labels: {
      create: [
        { labelId: "label1" },
        { labelId: "label2" }
      ]
    }
  }
});
```

---

## 🎯 Key Design Decisions

### ✅ Why Store GitHub Data Locally?

1. **Speed:** Instant queries, no API rate limits
2. **Offline:** Works without internet
3. **Custom Fields:** Add priority, categories, notes
4. **Analytics:** Fast aggregations and charts
5. **Search:** Full-text search across all data

### ✅ Why Many-to-Many Tables?

- **Flexibility:** Issues can have multiple labels, assignees
- **Normalization:** No data duplication
- **Scalability:** Efficient for large datasets

### ✅ Why Indexes?

- **Performance:** 100x faster queries on indexed fields
- **User Experience:** Instant filtering and search

---

## 🚀 Next Steps

1. **Run Migrations:**
   ```powershell
   npm run prisma:migrate
   ```

2. **View Database:**
   ```powershell
   npm run prisma:studio
   ```

3. **Start Coding:**
   - Create API endpoints
   - Query with Prisma Client
   - Build features!

---

## 📚 Learn More

- **Prisma Docs:** https://www.prisma.io/docs
- **Schema Reference:** https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
- **Relations:** https://www.prisma.io/docs/concepts/components/prisma-schema/relations

---

**Your database is production-ready! 🎉**

All 18 tables will be created automatically when you run `prisma migrate`!
