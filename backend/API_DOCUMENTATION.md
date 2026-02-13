# 🔌 DevFlow API Documentation - Complete List

## 📊 API Overview

Based on the SRS and database schema, you need **65+ API endpoints** organized into **10 categories**.

---

## 📈 API Statistics

| Category | Endpoints | Priority | Status |
|----------|-----------|----------|--------|
| Authentication | 5 | 🔴 High | TODO |
| Repositories | 7 | 🔴 High | TODO |
| Issues | 12 | 🔴 High | TODO |
| Labels | 6 | 🟡 Medium | TODO |
| Comments | 6 | 🔴 High | TODO |
| Categories | 6 | 🟡 Medium | TODO |
| Filters & Views | 5 | 🟡 Medium | TODO |
| Analytics | 6 | 🟢 Low | TODO |
| Notifications | 5 | 🟡 Medium | TODO |
| Additional Features | 12 | 🟢 Low | TODO |

**Total: 70 Endpoints**

---

## 🗂️ API Categories & Endpoints

---

## 1️⃣ AUTHENTICATION APIs (5 endpoints)

### Base Path: `/api/auth`

Authentication using GitHub OAuth and JWT tokens.

---

### **1.1 POST /api/auth/github**
**Initiate GitHub OAuth Login**

**Purpose:** Redirects user to GitHub for authentication.

**Request:**
```http
POST /api/auth/github
Content-Type: application/json
```

**Response:**
```json
{
  "redirectUrl": "https://github.com/login/oauth/authorize?client_id=xxx&redirect_uri=xxx&scope=repo,user:email"
}
```

**Flow:**
1. Client calls this endpoint
2. Get redirect URL to GitHub
3. Redirect user to GitHub
4. User approves permissions
5. GitHub redirects to callback

---

### **1.2 GET /api/auth/github/callback**
**GitHub OAuth Callback Handler**

**Purpose:** Receives OAuth code from GitHub and creates user session.

**Request:**
```http
GET /api/auth/github/callback?code=abc123&state=xyz
```

**Process:**
1. Receive OAuth code from GitHub
2. Exchange code for access token
3. Fetch user profile from GitHub
4. Create/update user in database
5. Generate JWT token
6. Redirect to frontend with token

**Response:** (Redirect to frontend)
```
HTTP/1.1 302 Found
Location: http://localhost:3000/auth/success?token=jwt_token_here
```

**Database Actions:**
- Check if `User` exists by `githubId`
- If not exists: Create new user
- If exists: Update `accessToken`, `tokenExpiry`
- Store encrypted tokens

---

### **1.3 GET /api/auth/me**
**Get Current User Profile**

**Purpose:** Retrieve authenticated user's information.

**Request:**
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "ckl1234567890",
    "email": "john@example.com",
    "name": "John Doe",
    "avatar": "https://avatars.githubusercontent.com/u/12345",
    "githubLogin": "johndoe",
    "createdAt": "2026-02-13T10:00:00Z"
  }
}
```

**Database Query:**
```typescript
await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    name: true,
    avatar: true,
    githubLogin: true,
    createdAt: true
  }
});
```

---

### **1.4 POST /api/auth/refresh**
**Refresh Access Token**

**Purpose:** Get new JWT token when current expires.

**Request:**
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "new_jwt_token",
  "expiresIn": "7d"
}
```

---

### **1.5 POST /api/auth/logout**
**Logout User**

**Purpose:** Invalidate current session.

**Request:**
```http
POST /api/auth/logout
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Process:**
- Add JWT to blacklist (optional)
- Clear client-side cookies
- Client deletes token from localStorage

---

## 2️⃣ REPOSITORY APIs (7 endpoints)

### Base Path: `/api/repositories`

Manage GitHub repositories.

---

### **2.1 GET /api/repositories**
**List All User Repositories**

**Purpose:** Get all repositories added by user.

**Request:**
```http
GET /api/repositories?group=Backend&page=1&limit=20
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `group` (optional) - Filter by custom group
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `search` (optional) - Search by name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ckl987654321",
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
      "lastSyncedAt": "2026-02-13T09:45:00Z",
      "userRole": "admin",
      "group": "Backend Projects"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

**Database Query:**
```typescript
await prisma.repository.findMany({
  where: {
    users: {
      some: { userId: authenticatedUserId }
    }
  },
  include: {
    users: {
      where: { userId: authenticatedUserId }
    }
  }
});
```

---

### **2.2 POST /api/repositories**
**Add New Repository**

**Purpose:** Add a GitHub repository to dashboard.

**Request:**
```http
POST /api/repositories
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "repoUrl": "https://github.com/johndoe/my-project",
  "group": "Frontend Projects"
}
```

**Process:**
1. Extract owner and repo name from URL
2. Call GitHub API to verify repo exists
3. Check user has access to repo
4. Fetch repo metadata (stars, forks, etc.)
5. Store in `repositories` table
6. Create link in `user_repositories` table
7. Sync all issues (call /sync endpoint internally)

**Response:**
```json
{
  "success": true,
  "message": "Repository added successfully",
  "data": {
    "id": "ckl987654321",
    "name": "my-project",
    "fullName": "johndoe/my-project",
    "openIssuesCount": 5,
    "issuesSynced": 5
  }
}
```

**Database Actions:**
- Check if repo already exists by `githubId`
- If exists: Just link to user in `user_repositories`
- If not: Create in `repositories` table
- Fetch and store all issues, labels, milestones

---

### **2.3 GET /api/repositories/:id**
**Get Repository Details**

**Purpose:** Get detailed info about specific repository.

**Request:**
```http
GET /api/repositories/ckl987654321
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ckl987654321",
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
    "lastSyncedAt": "2026-02-13T09:45:00Z",
    "createdAt": "2026-02-10T10:00:00Z",
    "stats": {
      "totalIssues": 45,
      "openIssues": 12,
      "closedIssues": 33,
      "labels": 8,
      "contributors": 5
    }
  }
}
```

---

### **2.4 PATCH /api/repositories/:id**
**Update Repository Settings**

**Purpose:** Update repository configuration.

**Request:**
```http
PATCH /api/repositories/ckl987654321
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "group": "Personal Projects",
  "webhookEnabled": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Repository updated successfully",
  "data": {
    "id": "ckl987654321",
    "group": "Personal Projects",
    "webhookEnabled": true
  }
}
```

---

### **2.5 DELETE /api/repositories/:id**
**Remove Repository**

**Purpose:** Remove repository from user's dashboard.

**Request:**
```http
DELETE /api/repositories/ckl987654321
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Repository removed successfully"
}
```

**Database Actions:**
- Delete entry from `user_repositories` (user-repo link)
- If no other users linked: Delete from `repositories`
- Cascade deletes all related data (issues, labels, etc.)

---

### **2.6 POST /api/repositories/:id/sync**
**Sync Repository Issues**

**Purpose:** Fetch latest issues from GitHub.

**Request:**
```http
POST /api/repositories/ckl987654321/sync
Authorization: Bearer <jwt_token>
```

**Process:**
1. Fetch all issues from GitHub API
2. Compare with database
3. Create new issues
4. Update existing issues
5. Sync labels, assignees, comments
6. Update `lastSyncedAt` timestamp

**Response:**
```json
{
  "success": true,
  "message": "Repository synced successfully",
  "stats": {
    "issuesAdded": 3,
    "issuesUpdated": 7,
    "issuesClosed": 2,
    "totalIssues": 45
  }
}
```

---

### **2.7 POST /api/repositories/:id/webhook**
**Setup GitHub Webhook**

**Purpose:** Configure webhook for real-time updates.

**Request:**
```http
POST /api/repositories/ckl987654321/webhook
Authorization: Bearer <jwt_token>
```

**Process:**
1. Call GitHub API to create webhook
2. Point to: `https://your-domain.com/api/webhooks/github`
3. Subscribe to events: issues, issue_comment, label
4. Store webhook ID in database

**Response:**
```json
{
  "success": true,
  "message": "Webhook configured successfully",
  "webhookId": "123456789"
}
```

---

## 3️⃣ ISSUE APIs (12 endpoints)

### Base Path: `/api/issues`

Core issue management.

---

### **3.1 GET /api/issues**
**List All Issues with Filters**

**Purpose:** Get issues across all repositories with advanced filtering.

**Request:**
```http
GET /api/issues?state=open&priority=P1&label=bug&repository=ckl987&assignee=me&search=login&page=1&limit=20&sort=updated&order=desc
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `state` | string | open/closed/all | `open` |
| `priority` | string | P0/P1/P2/P3 | `P1` |
| `label` | string | Filter by label name | `bug` |
| `repository` | string | Repository ID | `ckl987` |
| `assignee` | string | User ID or "me" | `me` |
| `search` | string | Search in title/body | `login` |
| `category` | string | Custom category ID | `cat123` |
| `milestone` | string | Milestone ID | `mil456` |
| `page` | number | Page number | `1` |
| `limit` | number | Items per page | `20` |
| `sort` | string | Sort field | `updated` |
| `order` | string | asc/desc | `desc` |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ckl111222333",
      "githubId": 789456123,
      "number": 42,
      "title": "Add dark mode to dashboard",
      "body": "Users are requesting dark mode...",
      "state": "open",
      "priority": "P1",
      "customStatus": "In Progress",
      "estimatedTime": 120,
      "repository": {
        "id": "ckl987",
        "name": "devflow",
        "fullName": "johndoe/devflow"
      },
      "creator": {
        "id": "ckl123",
        "name": "John Doe",
        "avatar": "https://..."
      },
      "labels": [
        { "id": "lab1", "name": "feature", "color": "0075ca" },
        { "id": "lab2", "name": "frontend", "color": "d4c5f9" }
      ],
      "assignees": [
        { "id": "user1", "name": "Jane Doe", "avatar": "https://..." }
      ],
      "categories": [
        { "id": "cat1", "name": "High Priority", "color": "ff0000" }
      ],
      "githubCreatedAt": "2026-02-10T14:30:00Z",
      "githubUpdatedAt": "2026-02-13T09:00:00Z",
      "commentsCount": 5,
      "url": "https://github.com/johndoe/devflow/issues/42"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  },
  "filters": {
    "state": "open",
    "priority": "P1",
    "appliedFilters": 2
  }
}
```

**Database Query Example:**
```typescript
await prisma.issue.findMany({
  where: {
    state: 'open',
    priority: 'P1',
    repository: {
      users: {
        some: { userId: authenticatedUserId }
      }
    },
    OR: [
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { body: { contains: searchTerm, mode: 'insensitive' } }
    ]
  },
  include: {
    repository: true,
    creator: true,
    labels: { include: { label: true } },
    assignees: true,
    categories: { include: { category: true } }
  },
  orderBy: { githubUpdatedAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit
});
```

---

### **3.2 GET /api/issues/:id**
**Get Single Issue Details**

**Purpose:** Get complete details of one issue.

**Request:**
```http
GET /api/issues/ckl111222333
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ckl111222333",
    "githubId": 789456123,
    "number": 42,
    "title": "Add dark mode to dashboard",
    "body": "Users are requesting dark mode for better usability...",
    "state": "open",
    "stateReason": null,
    "priority": "P1",
    "customStatus": "In Progress",
    "estimatedTime": 120,
    "repository": {
      "id": "ckl987",
      "name": "devflow",
      "fullName": "johndoe/devflow",
      "url": "https://github.com/johndoe/devflow"
    },
    "creator": {
      "id": "ckl123",
      "name": "John Doe",
      "avatar": "https://...",
      "githubLogin": "johndoe"
    },
    "labels": [...],
    "assignees": [...],
    "categories": [...],
    "milestone": {
      "id": "mil1",
      "title": "v1.0",
      "dueOn": "2026-03-01T00:00:00Z"
    },
    "comments": [...],
    "notes": [...],
    "timeEntries": [...],
    "reminders": [...],
    "githubCreatedAt": "2026-02-10T14:30:00Z",
    "githubUpdatedAt": "2026-02-13T09:00:00Z",
    "closedAt": null,
    "url": "https://github.com/johndoe/devflow/issues/42",
    "stats": {
      "commentsCount": 5,
      "timeSpent": 320,
      "notesCount": 2
    }
  }
}
```

---

### **3.3 POST /api/issues**
**Create New Issue**

**Purpose:** Create issue on GitHub and store locally.

**Request:**
```http
POST /api/issues
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "repositoryId": "ckl987654321",
  "title": "Fix login bug",
  "body": "Users cannot login with email containing +",
  "labels": ["bug", "priority-high"],
  "assignees": ["johndoe", "janedoe"],
  "milestone": "v1.0",
  "priority": "P0",
  "estimatedTime": 60
}
```

**Process:**
1. Validate user has access to repository
2. Create issue on GitHub via API
3. Store in local database
4. Link labels (create if don't exist)
5. Assign users
6. Set custom fields (priority, estimatedTime)

**Response:**
```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": "ckl999888777",
    "githubId": 987654321,
    "number": 46,
    "title": "Fix login bug",
    "url": "https://github.com/johndoe/devflow/issues/46",
    "createdAt": "2026-02-13T12:00:00Z"
  }
}
```

**GitHub API Call:**
```typescript
await octokit.rest.issues.create({
  owner: 'johndoe',
  repo: 'devflow',
  title: 'Fix login bug',
  body: 'Users cannot login...',
  labels: ['bug', 'priority-high'],
  assignees: ['johndoe', 'janedoe']
});
```

---

### **3.4 PATCH /api/issues/:id**
**Update Issue**

**Purpose:** Update issue on GitHub and locally.

**Request:**
```http
PATCH /api/issues/ckl111222333
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Add dark mode (updated)",
  "body": "Updated description",
  "state": "closed",
  "stateReason": "completed",
  "priority": "P2",
  "customStatus": "Done",
  "labels": ["feature", "enhancement"],
  "assignees": ["user123"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": "ckl111222333",
    "title": "Add dark mode (updated)",
    "state": "closed",
    "priority": "P2",
    "updatedAt": "2026-02-13T12:30:00Z"
  }
}
```

**Process:**
1. Update on GitHub (title, body, state, labels, assignees)
2. Update in database (including custom fields)
3. Sync changes

---

### **3.5 DELETE /api/issues/:id**
**Close/Delete Issue**

**Purpose:** Close issue on GitHub.

**Request:**
```http
DELETE /api/issues/ckl111222333?reason=completed
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Issue closed successfully"
}
```

**Note:** GitHub doesn't allow permanent deletion, only closing.

---

### **3.6 POST /api/issues/bulk**
**Bulk Issue Operations**

**Purpose:** Perform actions on multiple issues at once.

**Request:**
```http
POST /api/issues/bulk
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "action": "close",
  "issueIds": ["ckl111", "ckl222", "ckl333"],
  "data": {
    "stateReason": "completed",
    "comment": "Closing as completed"
  }
}
```

**Supported Actions:**
- `close` - Close multiple issues
- `label` - Add/remove labels
- `assign` - Assign to users
- `priority` - Set priority
- `category` - Add categories

**Response:**
```json
{
  "success": true,
  "message": "Bulk operation completed",
  "results": {
    "successful": 3,
    "failed": 0,
    "total": 3
  }
}
```

---

### **3.7 GET /api/issues/:id/comments**
**Get Issue Comments**

**Purpose:** Get all comments for an issue.

**Request:**
```http
GET /api/issues/ckl111222333/comments?page=1&limit=50
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "com123",
      "githubId": 456789,
      "body": "This is a great idea!",
      "user": {
        "id": "user1",
        "name": "Jane Doe",
        "avatar": "https://...",
        "githubLogin": "janedoe"
      },
      "githubCreatedAt": "2026-02-11T10:00:00Z",
      "githubUpdatedAt": "2026-02-11T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### **3.8 POST /api/issues/:id/comments**
**Add Comment to Issue**

**Purpose:** Post comment on GitHub issue.

**Request:**
```http
POST /api/issues/ckl111222333/comments
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "body": "Great work! This fixes the issue. @johndoe please review."
}
```

**Process:**
1. Post comment on GitHub
2. Store in database
3. Parse @mentions
4. Send notifications to mentioned users

**Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "id": "com999",
    "githubId": 789456,
    "body": "Great work!...",
    "createdAt": "2026-02-13T13:00:00Z"
  }
}
```

---

### **3.9 PATCH /api/issues/:id/comments/:commentId**
**Edit Comment**

**Purpose:** Update existing comment.

**Request:**
```http
PATCH /api/issues/ckl111222333/comments/com123
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "body": "Updated comment text"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment updated successfully"
}
```

---

### **3.10 DELETE /api/issues/:id/comments/:commentId**
**Delete Comment**

**Purpose:** Delete comment from GitHub and database.

**Request:**
```http
DELETE /api/issues/ckl111222333/comments/com123
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

### **3.11 POST /api/issues/:id/assign**
**Assign Users to Issue**

**Purpose:** Assign or unassign users.

**Request:**
```http
POST /api/issues/ckl111222333/assign
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "assignees": ["johndoe", "janedoe"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Users assigned successfully"
}
```

---

### **3.12 POST /api/issues/:id/labels**
**Add/Remove Labels**

**Purpose:** Manage issue labels.

**Request:**
```http
POST /api/issues/ckl111222333/labels
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "labels": ["bug", "high-priority"],
  "action": "add"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Labels updated successfully",
  "data": {
    "labels": ["bug", "high-priority", "feature"]
  }
}
```

---

## 4️⃣ LABEL APIs (6 endpoints)

### Base Path: `/api/labels`

Manage repository labels.

---

### **4.1 GET /api/repositories/:repoId/labels**
**Get Repository Labels**

**Request:**
```http
GET /api/repositories/ckl987/labels
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "lab1",
      "githubId": 123456,
      "name": "bug",
      "color": "d73a4a",
      "description": "Something isn't working",
      "issueCount": 12
    }
  ]
}
```

---

### **4.2 POST /api/repositories/:repoId/labels**
**Create Label**

**Request:**
```http
POST /api/repositories/ckl987/labels
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "urgent",
  "color": "ff0000",
  "description": "Needs immediate attention"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Label created successfully",
  "data": {
    "id": "lab999",
    "name": "urgent",
    "color": "ff0000"
  }
}
```

---

### **4.3 PATCH /api/labels/:id**
**Update Label**

**Request:**
```http
PATCH /api/labels/lab1
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "critical-bug",
  "color": "ff0000"
}
```

---

### **4.4 DELETE /api/labels/:id**
**Delete Label**

**Request:**
```http
DELETE /api/labels/lab1
Authorization: Bearer <jwt_token>
```

---

### **4.5 GET /api/labels**
**Get All Labels (across repos)**

**Request:**
```http
GET /api/labels?search=bug
Authorization: Bearer <jwt_token>
```

---

### **4.6 GET /api/labels/popular**
**Get Most Used Labels**

**Request:**
```http
GET /api/labels/popular?limit=10
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "name": "bug", "count": 45 },
    { "name": "feature", "count": 32 }
  ]
}
```

---

## 5️⃣ CATEGORY APIs (6 endpoints)

### Base Path: `/api/categories`

Custom categorization (not on GitHub).

---

### **5.1 GET /api/categories**
**Get User's Categories**

**Request:**
```http
GET /api/categories
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat1",
      "name": "Urgent",
      "color": "ff0000",
      "issueCount": 12,
      "createdAt": "2026-02-10T10:00:00Z"
    },
    {
      "id": "cat2",
      "name": "Tech Debt",
      "color": "fbca04",
      "issueCount": 8,
      "createdAt": "2026-02-11T10:00:00Z"
    }
  ]
}
```

---

### **5.2 POST /api/categories**
**Create Category**

**Request:**
```http
POST /api/categories
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Quick Win",
  "color": "0e8a16"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "cat999",
    "name": "Quick Win",
    "color": "0e8a16"
  }
}
```

---

### **5.3 PATCH /api/categories/:id**
**Update Category**

**Request:**
```http
PATCH /api/categories/cat1
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Critical",
  "color": "b60205"
}
```

---

### **5.4 DELETE /api/categories/:id**
**Delete Category**

**Request:**
```http
DELETE /api/categories/cat1
Authorization: Bearer <jwt_token>
```

---

### **5.5 POST /api/issues/:issueId/categories**
**Assign Categories to Issue**

**Request:**
```http
POST /api/issues/ckl111/categories
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "categoryIds": ["cat1", "cat2"]
}
```

---

### **5.6 DELETE /api/issues/:issueId/categories/:categoryId**
**Remove Category from Issue**

**Request:**
```http
DELETE /api/issues/ckl111/categories/cat1
Authorization: Bearer <jwt_token>
```

---

## 6️⃣ SAVED VIEWS / FILTERS APIs (5 endpoints)

### Base Path: `/api/views`

Save and manage filter combinations.

---

### **6.1 GET /api/views**
**Get Saved Views**

**Request:**
```http
GET /api/views
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "view1",
      "name": "High Priority Bugs",
      "filters": {
        "state": "open",
        "priority": ["P0", "P1"],
        "labels": ["bug"]
      },
      "isDefault": true,
      "createdAt": "2026-02-10T10:00:00Z"
    }
  ]
}
```

---

### **6.2 POST /api/views**
**Create Saved View**

**Request:**
```http
POST /api/views
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "This Week's Tasks",
  "filters": {
    "state": "open",
    "assignee": "me",
    "createdAfter": "2026-02-10"
  },
  "isDefault": false
}
```

---

### **6.3 PATCH /api/views/:id**
**Update Saved View**

---

### **6.4 DELETE /api/views/:id**
**Delete Saved View**

---

### **6.5 POST /api/views/:id/apply**
**Apply Saved View**

**Purpose:** Get issues with pre-saved filters.

**Request:**
```http
POST /api/views/view1/apply
Authorization: Bearer <jwt_token>
```

**Response:** Returns filtered issues

---

## 7️⃣ ANALYTICS APIs (6 endpoints)

### Base Path: `/api/analytics`

Dashboard analytics and insights.

---

### **7.1 GET /api/analytics/overview**
**Dashboard Overview**

**Purpose:** Get high-level statistics.

**Request:**
```http
GET /api/analytics/overview?timeRange=30d
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalIssues": 234,
    "openIssues": 45,
    "closedIssues": 189,
    "totalRepositories": 12,
    "totalLabels": 45,
    "issuesThisWeek": 12,
    "issuesClosedThisWeek": 8,
    "avgResponseTime": "4.5 hours",
    "avgResolutionTime": "2.3 days"
  }
}
```

---

### **7.2 GET /api/analytics/velocity**
**Issue Velocity Chart**

**Purpose:** Issues opened vs closed over time.

**Request:**
```http
GET /api/analytics/velocity?period=30d&interval=day
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "labels": ["Feb 10", "Feb 11", "Feb 12", "Feb 13"],
    "opened": [5, 3, 7, 4],
    "closed": [2, 4, 5, 6]
  }
}
```

---

### **7.3 GET /api/analytics/distribution**
**Issue Distribution**

**Purpose:** Breakdown by status, priority, labels.

**Request:**
```http
GET /api/analytics/distribution?type=priority
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "byPriority": {
      "P0": 8,
      "P1": 15,
      "P2": 12,
      "P3": 10
    },
    "byState": {
      "open": 45,
      "closed": 189
    },
    "byLabel": {
      "bug": 23,
      "feature": 18,
      "enhancement": 12
    }
  }
}
```

---

### **7.4 GET /api/analytics/contributors**
**Contributor Activity**

**Purpose:** Who's creating/closing/commenting on issues.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user": {
        "id": "user1",
        "name": "John Doe",
        "avatar": "https://..."
      },
      "issuesCreated": 12,
      "issuesClosed": 8,
      "commentsAdded": 45,
      "pullRequests": 6
    }
  ]
}
```

---

### **7.5 GET /api/analytics/burndown/:milestoneId**
**Milestone Burndown Chart**

**Purpose:** Track progress toward milestone completion.

**Response:**
```json
{
  "success": true,
  "data": {
    "milestone": {
      "id": "mil1",
      "title": "v1.0",
      "dueOn": "2026-03-01"
    },
    "totalIssues": 50,
    "completedIssues": 35,
    "remainingIssues": 15,
    "progress": 70,
    "chartData": [
      { "date": "Feb 1", "remaining": 50 },
      { "date": "Feb 10", "remaining": 30 },
      { "date": "Feb 13", "remaining": 15 }
    ]
  }
}
```

---

### **7.6 GET /api/analytics/health**
**Repository Health Score**

**Purpose:** Calculate repo health based on various metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "repositoryId": "ckl987",
    "healthScore": 85,
    "metrics": {
      "issueResponseTime": 90,
      "issueResolutionTime": 75,
      "issueAgeAvg": 80,
      "contributorActivity": 95
    },
    "recommendations": [
      "Address 3 issues older than 30 days",
      "Improve average response time"
    ]
  }
}
```

---

## 8️⃣ NOTIFICATION APIs (5 endpoints)

### Base Path: `/api/notifications`

In-app notifications.

---

### **8.1 GET /api/notifications**
**Get User Notifications**

**Request:**
```http
GET /api/notifications?unreadOnly=true&page=1&limit=20
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif1",
      "type": "assigned",
      "title": "You were assigned to an issue",
      "message": "John Doe assigned you to issue #42 in devflow",
      "link": "/issues/ckl111222333",
      "isRead": false,
      "createdAt": "2026-02-13T10:30:00Z"
    },
    {
      "id": "notif2",
      "type": "mention",
      "title": "You were mentioned",
      "message": "@you mentioned you in a comment",
      "link": "/issues/ckl444/comments/com123",
      "isRead": false,
      "createdAt": "2026-02-13T09:15:00Z"
    }
  ],
  "unreadCount": 5,
  "pagination": {...}
}
```

**Notification Types:**
- `assigned` - Assigned to issue
- `mention` - Mentioned in comment
- `status_change` - Issue status changed
- `comment` - New comment on watched issue
- `due_soon` - Issue due date approaching
- `reminder` - Custom reminder triggered

---

### **8.2 PATCH /api/notifications/:id/read**
**Mark Notification as Read**

**Request:**
```http
PATCH /api/notifications/notif1/read
Authorization: Bearer <jwt_token>
```

---

### **8.3 POST /api/notifications/read-all**
**Mark All as Read**

**Request:**
```http
POST /api/notifications/read-all
Authorization: Bearer <jwt_token>
```

---

### **8.4 GET /api/notifications/settings**
**Get Notification Preferences**

**Response:**
```json
{
  "success": true,
  "data": {
    "emailNotifications": true,
    "pushNotifications": true,
    "notifyOn": {
      "assigned": true,
      "mentioned": true,
      "statusChange": false,
      "comments": true
    }
  }
}
```

---

### **8.5 PATCH /api/notifications/settings**
**Update Notification Preferences**

**Request:**
```http
PATCH /api/notifications/settings
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "emailNotifications": false,
  "notifyOn": {
    "assigned": true,
    "mentioned": true
  }
}
```

---

## 9️⃣ NOTES & REMINDERS APIs (8 endpoints)

### Base Path: `/api/notes` & `/api/reminders`

Private notes and reminders.

---

### **9.1 GET /api/notes/:issueId**
**Get Notes for Issue**

**Request:**
```http
GET /api/notes/ckl111222333
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "note1",
      "content": "Discussed with client on call - high priority",
      "issueId": "ckl111222333",
      "createdAt": "2026-02-12T15:00:00Z",
      "updatedAt": "2026-02-12T15:00:00Z"
    }
  ]
}
```

---

### **9.2 POST /api/notes**
**Create Note**

**Request:**
```http
POST /api/notes
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "issueId": "ckl111222333",
  "content": "Need to follow up with design team"
}
```

---

### **9.3 PATCH /api/notes/:id**
**Update Note**

---

### **9.4 DELETE /api/notes/:id**
**Delete Note**

---

### **9.5 GET /api/reminders**
**Get User Reminders**

**Request:**
```http
GET /api/reminders?upcoming=true
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rem1",
      "issueId": "ckl111",
      "issue": {
        "number": 42,
        "title": "Add dark mode"
      },
      "remindAt": "2026-02-14T14:00:00Z",
      "message": "Review progress",
      "isCompleted": false
    }
  ]
}
```

---

### **9.6 POST /api/reminders**
**Create Reminder**

**Request:**
```http
POST /api/reminders
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "issueId": "ckl111222333",
  "remindAt": "2026-02-14T14:00:00Z",
  "message": "Follow up on this issue"
}
```

---

### **9.7 PATCH /api/reminders/:id**
**Update Reminder**

---

### **9.8 DELETE /api/reminders/:id**
**Delete Reminder**

---

## 🔟 TIME TRACKING APIs (6 endpoints)

### Base Path: `/api/time-entries`

Track time spent on issues.

---

### **10.1 GET /api/time-entries**
**Get Time Entries**

**Request:**
```http
GET /api/time-entries?issueId=ckl111&startDate=2026-02-01
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "time1",
      "issueId": "ckl111",
      "userId": "user1",
      "duration": 120,
      "description": "Implemented dark mode toggle",
      "startedAt": "2026-02-13T10:00:00Z",
      "endedAt": "2026-02-13T12:00:00Z"
    }
  ],
  "totalTime": 480
}
```

---

### **10.2 POST /api/time-entries**
**Create Time Entry**

**Request:**
```http
POST /api/time-entries
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "issueId": "ckl111222333",
  "duration": 90,
  "description": "Fixed CSS bugs",
  "startedAt": "2026-02-13T14:00:00Z",
  "endedAt": "2026-02-13T15:30:00Z"
}
```

---

### **10.3 POST /api/time-entries/start**
**Start Timer**

**Purpose:** Start tracking time (creates entry with no endedAt).

---

### **10.4 POST /api/time-entries/:id/stop**
**Stop Timer**

**Purpose:** Stop active timer (sets endedAt, calculates duration).

---

### **10.5 GET /api/time-entries/report**
**Generate Time Report**

**Request:**
```http
GET /api/time-entries/report?groupBy=issue&startDate=2026-02-01&endDate=2026-02-13
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTime": 2400,
    "byIssue": [
      {
        "issue": { "number": 42, "title": "Add dark mode" },
        "timeSpent": 480
      }
    ],
    "byDay": [...],
    "byRepository": [...]
  }
}
```

---

### **10.6 DELETE /api/time-entries/:id**
**Delete Time Entry**

---

## 1️⃣1️⃣ WEBHOOK APIs (2 endpoints)

### Base Path: `/api/webhooks`

Handle GitHub webhooks.

---

### **11.1 POST /api/webhooks/github**
**GitHub Webhook Handler**

**Purpose:** Receive events from GitHub and sync data.

**Request:** (From GitHub)
```http
POST /api/webhooks/github
X-GitHub-Event: issues
X-Hub-Signature-256: sha256=...
Content-Type: application/json

{
  "action": "opened",
  "issue": {...},
  "repository": {...}
}
```

**Events Handled:**
- `issues` - Issue created/updated/closed
- `issue_comment` - Comment added/edited/deleted
- `label` - Label created/edited/deleted
- `milestone` - Milestone created/updated

**Process:**
1. Verify webhook signature
2. Parse event type
3. Update database accordingly
4. Trigger notifications

---

### **11.2 GET /api/webhooks/status**
**Check Webhook Status**

**Purpose:** Verify webhook is configured and working.

---

## 1️⃣2️⃣ SEARCH APIs (3 endpoints)

### Base Path: `/api/search`

Global search functionality.

---

### **12.1 GET /api/search**
**Global Search**

**Purpose:** Search across issues, repos, comments.

**Request:**
```http
GET /api/search?q=login+bug&type=issues,comments&limit=20
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "issues": [...],
    "comments": [...],
    "repositories": [...]
  },
  "resultCount": {
    "issues": 5,
    "comments": 3,
    "repositories": 1
  }
}
```

---

### **12.2 GET /api/search/suggestions**
**Search Autocomplete**

**Purpose:** Get search suggestions as user types.

---

### **12.3 GET /api/search/history**
**Search History**

**Purpose:** Get user's recent searches.

---

## 1️⃣3️⃣ EXPORT APIs (2 endpoints)

### Base Path: `/api/export`

Export data.

---

### **13.1 GET /api/export/issues**
**Export Issues to CSV/JSON**

**Request:**
```http
GET /api/export/issues?format=csv&filters={...}
Authorization: Bearer <jwt_token>
```

**Response:** CSV/JSON file download

---

### **13.2 GET /api/export/report**
**Export Analytics Report**

**Purpose:** Generate PDF report with charts.

---

## 1️⃣4️⃣ TEAM APIs (Optional - 6 endpoints)

### Base Path: `/api/teams`

Team collaboration.

---

### **14.1 GET /api/teams**
**Get User Teams**

---

### **14.2 POST /api/teams**
**Create Team**

---

### **14.3 POST /api/teams/:id/members**
**Add Team Member**

---

### **14.4 DELETE /api/teams/:id/members/:userId**
**Remove Team Member**

---

### **14.5 PATCH /api/teams/:id/members/:userId/role**
**Update Member Role**

---

### **14.6 DELETE /api/teams/:id**
**Delete Team**

---

## 📋 API IMPLEMENTATION PRIORITY

### **Phase 1 - MVP (Week 1)**  🔴 Critical
1. Authentication (5 endpoints)
2. Repositories (5 core endpoints)
3. Issues (8 core endpoints)
4. Comments (4 endpoints)

**Total: 22 endpoints**

### **Phase 2 - Enhanced (Week 2-3)** 🟡 Important
5. Labels (6 endpoints)
6. Categories (6 endpoints)
7. Filters & Views (5 endpoints)
8. Notifications (5 endpoints)

**Total: 22 additional endpoints**

### **Phase 3 - Advanced (Week 4+)** 🟢 Nice-to-have
9. Analytics (6 endpoints)
10. Notes & Reminders (8 endpoints)
11. Time Tracking (6 endpoints)
12. Webhooks (2 endpoints)
13. Search (3 endpoints)
14. Export (2 endpoints)
15. Teams (6 endpoints)

**Total: 33 additional endpoints**

---

## 🎯 API Best Practices

### Authentication
- All APIs except `/auth/github` require JWT token
- Token sent in `Authorization: Bearer <token>` header

### Response Format
```json
{
  "success": true | false,
  "message": "Human readable message",
  "data": {...},
  "error": "Error message if failed",
  "pagination": {...}
}
```

### HTTP Status Codes
- `200 OK` - Success
- `201 Created` - Created successfully
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - No permission
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limited
- `500 Internal Server Error` - Server error

### Rate Limiting
- 100 requests per 15 minutes per IP
- Higher limits for authenticated users

### Pagination
```json
{
  "page": 1,
  "limit": 20,
  "total": 100,
  "totalPages": 5,
  "hasNext": true,
  "hasPrev": false
}
```

---

## 🚀 Quick Reference by Use Case

### Creating an Issue Workflow:
1. `GET /api/repositories` - Get repo list
2. `POST /api/issues` - Create issue
3. `POST /api/issues/:id/labels` - Add labels
4. `POST /api/issues/:id/assign` - Assign users

### Dashboard Load:
1. `GET /api/auth/me` - Get user
2. `GET /api/repositories` - Get repos
3. `GET /api/issues?state=open` - Get open issues
4. `GET /api/notifications?unreadOnly=true` - Get notifications
5. `GET /api/analytics/overview` - Get stats

### Syncing Data:
1. `POST /api/repositories/:id/sync` - Manual sync
2. OR setup webhook: `POST /api/repositories/:id/webhook`
3. GitHub auto-sends to: `POST /api/webhooks/github`

---

**Total APIs: 70 Endpoints** 🎉

Ready to start implementing! Want me to create the actual API code for any specific category?
