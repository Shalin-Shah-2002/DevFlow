# DevFlow - Frontend API Integration Flows

Complete guide for frontend developers to integrate DevFlow APIs for a seamless user experience.

**Base URL:** `http://localhost:3001/api`  
**Authentication:** All endpoints (except login) require `Authorization: Bearer <JWT_TOKEN>` header  
**Token Expiry:** 7 days

---

## 📋 Table of Contents

1. [Authentication Flow](#1-authentication-flow)
2. [Onboarding Flow](#2-onboarding-flow)
3. [Dashboard/Home Flow](#3-dashboardhome-flow)
4. [Repository Management Flow](#4-repository-management-flow)
5. [Issue Management Flow](#5-issue-management-flow)
6. [Saved Views Flow](#6-saved-views-flow)
7. [Labels & Categories Flow](#7-labels--categories-flow)
8. [Notifications Flow](#8-notifications-flow)
9. [Analytics/Reports Flow](#9-analyticsreports-flow)
10. [Settings & Profile Flow](#10-settings--profile-flow)
11. [Error Handling & Edge Cases](#11-error-handling--edge-cases)

---

## 1. Authentication Flow

### 1.1 Initial Login (GitHub OAuth)

```
User Action: Click "Login with GitHub"
├─ Step 1: GET /api/auth/github
│  Response: Redirects to GitHub OAuth page
│  Frontend: Handle redirect automatically
│
├─ Step 2: User authorizes on GitHub
│  GitHub redirects to: /api/auth/github/callback?code=...
│
└─ Step 3: Backend handles callback
   Response: Redirects to frontend with JWT in URL params
   Frontend URL: http://localhost:3000/auth/callback?token=<JWT>
   
   Frontend Actions:
   1. Extract token from URL params
   2. Store token in localStorage/secure storage
   3. Set Authorization header: `Bearer ${token}`
   4. Redirect to /dashboard
```

**API Endpoints:**
- `GET /api/auth/github` - Initiate OAuth
- `GET /api/auth/github/callback` - OAuth callback (handled by backend)

---

### 1.2 Checking Authentication Status

```
Page Load / App Initialization
├─ Check if token exists in localStorage
│
├─ If token exists:
│  └─ GET /api/auth/me
│     Headers: { Authorization: Bearer <token> }
│     
│     Success Response (200):
│     {
│       "success": true,
│       "user": {
│         "id": "cmlm7a46u...",
│         "email": "user@example.com",
│         "name": "John Doe",
│         "githubId": 168978537,
│         "githubLogin": "johndoe",
│         "avatar": "https://avatars.githubusercontent.com/...",
│         "bio": "Developer",
│         "location": "San Francisco",
│         "company": "Acme Inc"
│       }
│     }
│     → Store user data in global state (Redux/Context)
│     → Show authenticated UI
│
│     Error Response (401):
│     → Clear token from storage
│     → Redirect to /login
│
└─ If no token:
   → Show login page
```

**API Endpoint:**
- `GET /api/auth/me` - Get current user profile

---

### 1.3 Token Refresh

```
Periodic Action (every 6 days or before token expires)
└─ POST /api/auth/refresh
   Headers: { Authorization: Bearer <old_token> }
   
   Success Response (200):
   {
     "success": true,
     "token": "eyJhbGci...",
     "message": "Token refreshed successfully"
   }
   → Replace old token with new token in storage
   → Update Authorization header
```

**API Endpoint:**
- `POST /api/auth/refresh` - Refresh JWT token

---

### 1.4 Logout

```
User Action: Click "Logout"
└─ POST /api/auth/logout
   Headers: { Authorization: Bearer <token> }
   
   Response (200):
   {
     "success": true,
     "message": "Logged out successfully"
   }
   
   Frontend Actions:
   1. Clear token from localStorage
   2. Clear user state from Redux/Context
   3. Redirect to /login
```

**API Endpoint:**
- `POST /api/auth/logout` - Logout user

---

## 2. Onboarding Flow

### 2.1 First-Time User Setup

```
After First Login (user.repositories_count === 0)
├─ Step 1: Show welcome screen
│
├─ Step 2: Add First Repository
│  POST /api/repositories
│  Body: {
│    "fullName": "facebook/react",
│    "group": "Open Source"  // Optional
│  }
│  
│  Response (201):
│  {
│    "id": "repo_id",
│    "name": "react",
│    "fullName": "facebook/react",
│    "url": "https://github.com/facebook/react",
│    "group": "Open Source",
│    "stats": { "open": 0, "closed": 0, "total": 0 }
│  }
│
├─ Step 3: Sync Initial Issues
│  POST /api/repositories/{repo_id}/sync
│  
│  Response (200):
│  {
│    "success": true,
│    "stats": {
│      "issuesAdded": 150,
│      "issuesUpdated": 0,
│      "issuesClosed": 0,
│      "totalIssues": 150
│    }
│  }
│  → Show progress: "Synced 150 issues from GitHub"
│
├─ Step 4: Sync Labels (Optional)
│  POST /api/labels/sync/{repo_id}
│  
│  Response (200):
│  {
│    "success": true,
│    "labelsAdded": 12,
│    "labelsUpdated": 0,
│    "total": 12
│  }
│
└─ Step 5: Create Default Categories
   POST /api/categories (repeat for each)
   Body: { "name": "Frontend", "color": "3B82F6" }
   Body: { "name": "Backend", "color": "10B981" }
   Body: { "name": "Bug", "color": "EF4444" }
   
   → Redirect to /dashboard
```

---

## 3. Dashboard/Home Flow

### 3.1 Dashboard Load Sequence

```
User Navigates to /dashboard
├─ Parallel API Calls (for better performance):
│
├─ Call 1: GET /api/analytics/dashboard
│  Response includes:
│  {
│    "totalIssues": 234,
│    "openIssues": 123,
│    "closedIssues": 111,
│    "averageCloseTime": 5.2,
│    "issuesByPriority": { "P0": 12, "P1": 34, ... },
│    "recentActivity": [...],
│    "topRepositories": [...]
│  }
│
├─ Call 2: GET /api/issues?state=open&limit=10&sort=priority&order=desc
│  Response: Top 10 priority issues
│
├─ Call 3: GET /api/notifications/unread-count
│  Response: { "unreadCount": 5 }
│  → Update notification badge
│
└─ Call 4: GET /api/views
   Response: User's saved views
   → Load default view if exists
```

**API Endpoints:**
- `GET /api/analytics/dashboard` - Dashboard overview
- `GET /api/issues` - List issues with filters
- `GET /api/notifications/unread-count` - Unread notification count
- `GET /api/views` - Get saved views

---

### 3.2 Dashboard Widget: Issues Over Time

```
Widget Load: Issues Timeline Chart
└─ GET /api/analytics/issues-over-time?days=30
   
   Response:
   {
     "timeline": [
       { "date": "2026-02-01", "created": 12, "closed": 8 },
       { "date": "2026-02-02", "created": 15, "closed": 10 },
       ...
     ]
   }
   → Render line chart showing issue trends
```

**API Endpoint:**
- `GET /api/analytics/issues-over-time` - Timeline data

---

### 3.3 Dashboard Widget: Team Workload

```
Widget Load: Assignee Workload
└─ GET /api/analytics/assignee-workload
   
   Response:
   {
     "workload": [
       {
         "assignee": { "name": "John", "avatar": "..." },
         "totalIssues": 23,
         "openIssues": 15,
         "closedIssues": 8
       },
       ...
     ]
   }
   → Render bar chart or table
```

**API Endpoint:**
- `GET /api/analytics/assignee-workload` - Assignee workload

---

## 4. Repository Management Flow

### 4.1 Repositories List Page

```
User Navigates to /repositories
├─ Initial Load:
│  GET /api/repositories?page=1&limit=20
│  
│  Response:
│  {
│    "repositories": [
│      {
│        "id": "repo_id",
│        "name": "react",
│        "fullName": "facebook/react",
│        "description": "A JavaScript library...",
│        "url": "https://github.com/facebook/react",
│        "isPrivate": false,
│        "group": "Open Source",
│        "stats": { "open": 150, "closed": 1200, "total": 1350 },
│        "lastSyncedAt": "2026-03-03T10:00:00Z"
│      },
│      ...
│    ],
│    "pagination": {
│      "page": 1,
│      "limit": 20,
│      "total": 3,
│      "totalPages": 1
│    }
│  }
│
├─ Apply Filters (if user changes filter):
│  GET /api/repositories?group=Open Source
│  → Update list
│
└─ Search (if user types in search):
   GET /api/repositories?search=react
   → Update list
```

**API Endpoint:**
- `GET /api/repositories` - List repositories
  - Query params: `page`, `limit`, `search`, `group`

---

### 4.2 Add New Repository

```
User Action: Click "Add Repository"
├─ Step 1: Show modal/form
│  User enters: "owner/repo" (e.g., "microsoft/vscode")
│  Optional: Group name
│
├─ Step 2: Submit
│  POST /api/repositories
│  Body: {
│    "fullName": "microsoft/vscode",
│    "group": "VS Code Ecosystem"
│  }
│  
│  Success Response (201):
│  {
│    "id": "new_repo_id",
│    "name": "vscode",
│    "fullName": "microsoft/vscode",
│    ...
│  }
│  → Close modal
│  → Show success toast: "Repository added successfully"
│  → Refresh repository list
│
├─ Step 3: Auto-sync (optional, can ask user)
│  POST /api/repositories/{new_repo_id}/sync
│  → Show loading: "Syncing issues from GitHub..."
│  
│  Response:
│  { "stats": { "issuesAdded": 234, ... } }
│  → Show success: "Synced 234 issues"
│
└─ Step 4: Sync labels (optional)
   POST /api/labels/sync/{new_repo_id}
   → Show success: "Synced 15 labels"
```

**API Endpoints:**
- `POST /api/repositories` - Add repository
- `POST /api/repositories/:id/sync` - Sync issues
- `POST /api/labels/sync/:repoId` - Sync labels

---

### 4.3 Repository Details Page

```
User Clicks on Repository
├─ Navigate to: /repositories/{repo_id}
│
├─ Load Repository Details:
│  GET /api/repositories/{repo_id}
│  
│  Response:
│  {
│    "id": "repo_id",
│    "name": "react",
│    "fullName": "facebook/react",
│    "description": "...",
│    "url": "https://github.com/facebook/react",
│    "group": "Open Source",
│    "stats": { "open": 150, "closed": 1200, "total": 1350 },
│    "lastSyncedAt": "2026-03-03T10:00:00Z",
│    "webhookConfigured": false
│  }
│
├─ Load Repository Issues:
│  GET /api/issues?repository={repo_id}&page=1&limit=20
│  → Display issues table
│
├─ Load Repository Analytics:
│  GET /api/analytics/issues-by-status?repository={repo_id}
│  → Display pie chart
│
└─ Actions:
   ├─ Manual Sync: POST /api/repositories/{repo_id}/sync
   ├─ Setup Webhook: POST /api/repositories/{repo_id}/webhook
   ├─ Edit Group: PATCH /api/repositories/{repo_id}
   └─ Delete: DELETE /api/repositories/{repo_id}
```

**API Endpoints:**
- `GET /api/repositories/:id` - Get repository details
- `GET /api/issues?repository=:id` - Get repository issues
- `PATCH /api/repositories/:id` - Update repository
- `DELETE /api/repositories/:id` - Delete repository

---

### 4.4 Manual Sync Issues

```
User Action: Click "Sync Issues" button on repository
├─ Show loading state on button
│
├─ POST /api/repositories/{repo_id}/sync
│  
│  Success Response (200):
│  {
│    "success": true,
│    "stats": {
│      "issuesAdded": 12,
│      "issuesUpdated": 45,
│      "issuesClosed": 3,
│      "totalIssues": 150
│    }
│  }
│  
│  Frontend Actions:
│  1. Hide loading state
│  2. Show toast: "Synced: +12 new, ~45 updated, ✓3 closed"
│  3. Refresh issue list
│  4. Update repository stats
│
└─ Error Handling:
   Error Response (500):
   {
     "error": "GitHub API rate limit exceeded. Try again in 30 minutes."
   }
   → Show error toast with retry option
```

**API Endpoint:**
- `POST /api/repositories/:id/sync` - Sync issues from GitHub

---

### 4.5 Setup Webhook (Advanced)

```
User Action: Click "Setup Webhook"
├─ Show info modal:
│  "Webhooks require a publicly accessible URL.
│   Use ngrok or deploy to setup webhooks."
│
├─ If user proceeds:
│  POST /api/repositories/{repo_id}/webhook
│  
│  Success Response (200):
│  {
│    "success": true,
│    "message": "Webhook configured successfully",
│    "webhookUrl": "https://your-domain.com/api/webhooks/github"
│  }
│  → Show success message
│  → Mark webhook as "Active" in UI
│
└─ Error Response (500):
   {
     "error": "Webhook URL must be publicly accessible. Localhost URLs not supported..."
   }
   → Show error with documentation link
```

**API Endpoint:**
- `POST /api/repositories/:id/webhook` - Setup GitHub webhook

---

## 5. Issue Management Flow

### 5.1 Issues List Page

```
User Navigates to /issues
├─ Initial Load (with default filters):
│  GET /api/issues?state=open&page=1&limit=20&sort=priority&order=desc
│  
│  Response:
│  {
│    "issues": [
│      {
│        "id": "issue_id",
│        "number": 12345,
│        "title": "Fix login bug",
│        "state": "open",
│        "priority": "P0",
│        "customStatus": "In Progress",
│        "githubUrl": "https://github.com/...",
│        "repository": { "id": "...", "name": "react" },
│        "creator": { "name": "John", "avatar": "..." },
│        "labels": [{ "name": "bug", "color": "d73a4a" }],
│        "assignees": [{ "name": "Jane", "avatar": "..." }],
│        "githubCreatedAt": "2026-03-01T10:00:00Z",
│        "githubUpdatedAt": "2026-03-03T15:30:00Z",
│        "commentsCount": 5
│      },
│      ...
│    ],
│    "pagination": { ... }
│  }
│
├─ Apply Filters (user interaction):
│  Filter by state: GET /api/issues?state=closed
│  Filter by priority: GET /api/issues?priority=P0,P1
│  Filter by label: GET /api/issues?label=bug
│  Filter by repository: GET /api/issues?repository={repo_id}
│  Filter by assignee: GET /api/issues?assignee=johndoe
│  Filter by category: GET /api/issues?category={category_id}
│  Search: GET /api/issues?search=login bug
│  Date range: GET /api/issues?createdAfter=2026-03-01T00:00:00Z
│  
│  → Update list dynamically
│
└─ Change sorting:
   GET /api/issues?sort=updated&order=desc
   → Re-render list
```

**API Endpoint:**
- `GET /api/issues` - List issues with filters
  - Query params: `state`, `priority`, `label`, `repository`, `assignee`, `category`, `milestone`, `search`, `createdAfter`, `createdBefore`, `sort`, `order`, `page`, `limit`

---

### 5.2 Issue Details Page

```
User Clicks on Issue
├─ Navigate to: /issues/{issue_id}
│
├─ Load Issue Details:
│  GET /api/issues/{issue_id}
│  
│  Response:
│  {
│    "id": "issue_id",
│    "number": 12345,
│    "title": "Fix login bug",
│    "body": "Detailed description...",
│    "state": "open",
│    "stateReason": null,
│    "priority": "P0",
│    "customStatus": "In Progress",
│    "estimatedTime": 8,
│    "githubUrl": "https://github.com/...",
│    "repository": { ... },
│    "creator": { ... },
│    "labels": [ ... ],
│    "assignees": [ ... ],
│    "categories": [ ... ],
│    "milestone": { "title": "v1.0", ... },
│    "githubCreatedAt": "2026-03-01T10:00:00Z",
│    "githubUpdatedAt": "2026-03-03T15:30:00Z",
│    "githubClosedAt": null,
│    "commentsCount": 5,
│    "timeTracking": { ... }
│  }
│
├─ Display components:
│  ├─ Issue header (title, number, state)
│  ├─ Metadata (priority, status, assignees, labels)
│  ├─ Categories (if assigned)
│  ├─ Description (body)
│  ├─ Comments section
│  └─ Activity timeline
│
└─ Actions available:
   ├─ Edit issue (inline or modal)
   ├─ Change status/priority
   ├─ Add/remove labels
   ├─ Assign/unassign users
   ├─ Add to categories
   ├─ Close/reopen issue
   └─ View on GitHub (external link)
```

**API Endpoint:**
- `GET /api/issues/:id` - Get issue details

---

### 5.3 Create New Issue

```
User Action: Click "New Issue" button
├─ Step 1: Show create issue form
│  Required fields:
│  - Repository (dropdown)
│  - Title (text input)
│  
│  Optional fields:
│  - Description/Body (markdown editor)
│  - Priority (P0/P1/P2/P3)
│  - Custom Status (text)
│  - Labels (multi-select)
│  - Assignees (multi-select)
│  - Milestone (dropdown)
│  - Estimated Time (hours)
│
├─ Load form dependencies:
│  GET /api/repositories → Populate repository dropdown
│  GET /api/labels → Populate labels multi-select
│  
├─ Step 2: User fills form and submits
│  POST /api/issues
│  Body: {
│    "repositoryId": "repo_id",
│    "title": "Implement dark mode",
│    "body": "Add dark mode support to the application...",
│    "priority": "P1",
│    "customStatus": "Backlog",
│    "labels": ["enhancement", "ui"],
│    "assignees": ["user_id_1"],
│    "estimatedTime": 16
│  }
│  
│  Success Response (201):
│  {
│    "id": "new_issue_id",
│    "number": 12346,
│    "title": "Implement dark mode",
│    ...
│  }
│  
│  Frontend Actions:
│  1. Close form/modal
│  2. Show success toast: "Issue created successfully"
│  3. Navigate to: /issues/{new_issue_id}
│     OR refresh issues list if staying on list page
│
└─ Error Handling:
   Error Response (400):
   { "error": "Title is required" }
   → Show validation error on form
```

**API Endpoints:**
- `POST /api/issues` - Create new issue
- `GET /api/repositories` - Get repositories for dropdown
- `GET /api/labels` - Get labels for multi-select

---

### 5.4 Update Issue

```
User Action: Edit issue (from details page)
├─ Inline editing (quick updates):
│  User changes priority dropdown: P0 → P1
│  
│  PATCH /api/issues/{issue_id}
│  Body: { "priority": "P1" }
│  
│  Response (200):
│  { "id": "...", "priority": "P1", ... }
│  → Update UI immediately
│  → Show toast: "Priority updated"
│
├─ Modal editing (complex updates):
│  User clicks "Edit" button → Show modal with current values
│  User modifies title, body, adds labels
│  
│  PATCH /api/issues/{issue_id}
│  Body: {
│    "title": "Updated title",
│    "body": "Updated description",
│    "labels": ["bug", "ui", "critical"]
│  }
│  
│  Response (200):
│  → Update issue details in UI
│  → Close modal
│  → Show success toast
│
├─ Change issue state (close/reopen):
│  User clicks "Close Issue" button
│  
│  PATCH /api/issues/{issue_id}
│  Body: {
│    "state": "closed",
│    "stateReason": "completed"
│  }
│  
│  Response (200):
│  → Update UI to show closed state
│  → Show toast: "Issue closed"
│
└─ Update custom fields (DevFlow-specific):
   User updates custom status: "In Progress" → "Done"
   User updates estimated time: 8 → 12 hours
   
   PATCH /api/issues/{issue_id}
   Body: {
     "customStatus": "Done",
     "estimatedTime": 12
   }
```

**API Endpoint:**
- `PATCH /api/issues/:id` - Update issue

---

### 5.5 Assign Categories to Issue

```
User Action: Click "Add to Category" on issue
├─ Step 1: Load available categories
│  GET /api/categories
│  
│  Response:
│  [
│    { "id": "cat1", "name": "Frontend", "color": "3B82F6" },
│    { "id": "cat2", "name": "Backend", "color": "10B981" },
│    ...
│  ]
│  → Show category picker modal
│
├─ Step 2: User selects categories
│  POST /api/issues/{issue_id}/categories
│  Body: {
│    "categoryIds": ["cat1", "cat2"]
│  }
│  
│  Success Response (200):
│  {
│    "success": true,
│    "message": "Categories assigned successfully",
│    "categories": [...]
│  }
│  → Update issue details to show categories
│  → Close modal
│
└─ Remove category from issue:
   User clicks "×" on category chip
   
   DELETE /api/issues/{issue_id}/categories/{category_id}
   
   Response (200):
   → Remove category chip from UI
```

**API Endpoints:**
- `GET /api/categories` - Get user categories
- `POST /api/issues/:id/categories` - Assign categories
- `DELETE /api/issues/:id/categories/:categoryId` - Remove category

---

### 5.6 Delete Issue

```
User Action: Click "Delete Issue" button
├─ Step 1: Show confirmation dialog
│  "Are you sure you want to delete this issue?
│   This action cannot be undone."
│
├─ User confirms:
│  DELETE /api/issues/{issue_id}
│  
│  Success Response (200):
│  {
│    "success": true,
│    "message": "Issue deleted successfully"
│  }
│  
│  Frontend Actions:
│  1. If on issue details page: Navigate back to /issues
│  2. If on issues list: Remove issue from list
│  3. Show toast: "Issue deleted"
│
└─ User cancels:
   → Close dialog, no API call
```

**API Endpoint:**
- `DELETE /api/issues/:id` - Delete issue

---

## 6. Saved Views Flow

### 6.1 Load Views Sidebar

```
App Initialization / Issues Page Load
└─ GET /api/views
   
   Response:
   [
     {
       "id": "view1",
       "name": "My P0 Bugs",
       "filters": {
         "state": "open",
         "priority": ["P0"],
         "assignee": "me",
         "labels": ["bug"]
       },
       "isDefault": true,
       "createdAt": "2026-03-01T10:00:00Z"
     },
     {
       "id": "view2",
       "name": "Frontend Issues",
       "filters": {
         "category": "category_id",
         "state": "open"
       },
       "isDefault": false
     },
     ...
   ]
   
   Frontend Actions:
   1. Display views in sidebar (default view at top)
   2. If default view exists → Auto-apply it
   3. Highlight active view
```

**API Endpoint:**
- `GET /api/views` - Get all saved views

---

### 6.2 Apply Saved View

```
User Action: Click on a view in sidebar
├─ Option A: Manually apply filters (client-side)
│  1. Read view.filters object
│  2. Build query params from filters
│  3. Call: GET /api/issues?state=open&priority=P0&assignee=me&labels=bug
│  4. Update issues list
│
└─ Option B: Use apply endpoint (server-side)
   POST /api/views/{view_id}/apply?page=1&limit=20
   
   Response:
   {
     "view": {
       "id": "view1",
       "name": "My P0 Bugs",
       "filters": { ... }
     },
     "issues": [ ... ],
     "pagination": { ... }
   }
   
   Frontend Actions:
   1. Update issues list with response
   2. Highlight active view in sidebar
   3. Update URL: /issues?view=view1
```

**API Endpoint:**
- `POST /api/views/:id/apply` - Apply view and get filtered issues

---

### 6.3 Create New View

```
User Action: Click "Save Current View"
├─ Step 1: Collect active filters from UI state
│  Current filters:
│  - State: open
│  - Priority: P0, P1
│  - Repository: repo_id
│  - Sort: priority desc
│
├─ Step 2: Show save dialog
│  Input: View name (e.g., "Critical Open Issues")
│  Checkbox: Set as default view
│
├─ Step 3: Submit
│  POST /api/views
│  Body: {
│    "name": "Critical Open Issues",
│    "filters": {
│      "state": "open",
│      "priority": ["P0", "P1"],
│      "repository": "repo_id",
│      "sort": "priority",
│      "order": "desc"
│    },
│    "isDefault": false
│  }
│  
│  Success Response (201):
│  {
│    "id": "new_view_id",
│    "name": "Critical Open Issues",
│    "filters": { ... },
│    "isDefault": false,
│    "userId": "...",
│    "createdAt": "2026-03-03T10:00:00Z"
│  }
│  
│  Frontend Actions:
│  1. Add new view to sidebar
│  2. Highlight it as active
│  3. Show toast: "View saved successfully"
│
└─ If isDefault: true
   → API automatically unsets other default views
   → Update UI to show new default view indicator
```

**API Endpoint:**
- `POST /api/views` - Create saved view

---

### 6.4 Update View

```
User Action: Right-click view → "Edit"
├─ Show edit dialog with current values:
│  - Name: "My P0 Bugs"
│  - Is Default: true
│
├─ User modifies:
│  - Name: "Critical Bugs Assigned to Me"
│  - Keep as default
│
└─ Submit:
   PATCH /api/views/{view_id}
   Body: {
     "name": "Critical Bugs Assigned to Me",
     "isDefault": true
   }
   
   Response (200):
   → Update view name in sidebar
   → Show toast: "View updated"
```

**API Endpoint:**
- `PATCH /api/views/:id` - Update saved view

---

### 6.5 Delete View

```
User Action: Right-click view → "Delete"
├─ Show confirmation: "Delete this view?"
│
└─ User confirms:
   DELETE /api/views/{view_id}
   
   Response (200):
   {
     "success": true,
     "message": "View deleted successfully"
   }
   
   Frontend Actions:
   1. Remove view from sidebar
   2. If it was active → Load "All Issues" default view
   3. Show toast: "View deleted"
```

**API Endpoint:**
- `DELETE /api/views/:id` - Delete saved view

---

## 7. Labels & Categories Flow

### 7.1 Labels Management

```
User Navigates to /settings/labels
├─ Load labels:
│  GET /api/labels?page=1&limit=50
│  
│  Response:
│  {
│    "labels": [
│      {
│        "id": "label1",
│        "name": "bug",
│        "color": "d73a4a",
│        "description": "Something isn't working",
│        "githubId": 123456,
│        "repository": { "id": "...", "name": "react" },
│        "issueCount": 45
│      },
│      ...
│    ],
│    "pagination": { ... }
│  }
│
├─ Filter by repository:
│  GET /api/labels?repository={repo_id}
│  → Show labels for specific repo
│
├─ Search labels:
│  GET /api/labels?search=bug
│  → Filter list
│
└─ Display labels with:
   - Color chip
   - Name
   - Description
   - Repository name
   - Issue count
   - Actions (edit/delete)
```

**API Endpoint:**
- `GET /api/labels` - List labels
  - Query params: `repository`, `search`, `page`, `limit`

---

### 7.2 Create Label

```
User Action: Click "Create Label"
├─ Show form:
│  - Name (required)
│  - Color (color picker, 6-char hex)
│  - Description (optional)
│  - Repository (dropdown, required if creating for specific repo)
│
└─ Submit:
   POST /api/labels
   Body: {
     "name": "enhancement",
     "color": "a2eeef",
     "description": "New feature or request",
     "repositoryId": "repo_id"  // Optional
   }
   
   Success Response (201):
   {
     "id": "new_label_id",
     "name": "enhancement",
     "color": "a2eeef",
     ...
   }
   → Add to labels list
   → Show toast: "Label created"
```

**API Endpoint:**
- `POST /api/labels` - Create label

---

### 7.3 Sync Labels from GitHub

```
User Action: Click "Sync Labels" on repository page
├─ Show loading indicator
│
└─ POST /api/labels/sync/{repo_id}
   
   Success Response (200):
   {
     "success": true,
     "labelsAdded": 12,
     "labelsUpdated": 3,
     "total": 15
   }
   
   Frontend Actions:
   1. Hide loading
   2. Show toast: "Synced 12 new labels, updated 3"
   3. Refresh labels list
```

**API Endpoint:**
- `POST /api/labels/sync/:repoId` - Sync labels from GitHub

---

### 7.4 Categories Management

```
User Navigates to /settings/categories
├─ Load categories:
│  GET /api/categories
│  
│  Response:
│  [
│    {
│      "id": "cat1",
│      "name": "Frontend",
│      "color": "3B82F6",
│      "issueCount": 67,
│      "createdAt": "2026-03-01T10:00:00Z"
│    },
│    {
│      "id": "cat2",
│      "name": "Backend",
│      "color": "10B981",
│      "issueCount": 45
│    },
│    ...
│  ]
│  
│  Display as cards with:
│  - Color indicator
│  - Category name
│  - Issue count
│  - Actions (edit/delete)
│
├─ Create category:
│  POST /api/categories
│  Body: { "name": "Database", "color": "8B5CF6" }
│  → Add to list
│
├─ Update category:
│  PATCH /api/categories/{cat_id}
│  Body: { "name": "Backend API", "color": "10B981" }
│  → Update in UI
│
└─ Delete category:
   DELETE /api/categories/{cat_id}
   → Remove from list
```

**API Endpoints:**
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PATCH /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

---

## 8. Notifications Flow

### 8.1 Notification Bell Icon

```
App Header Component (persistent)
├─ On mount / every 30 seconds:
│  GET /api/notifications/unread-count
│  
│  Response:
│  { "unreadCount": 5 }
│  
│  Frontend:
│  → Update badge count on bell icon
│  → If count > 0: Show red badge
│
└─ User clicks bell icon:
   → Open notification dropdown/panel
   → Call full notifications list
```

**API Endpoint:**
- `GET /api/notifications/unread-count` - Get unread count

---

### 8.2 Notifications Panel

```
User Clicks Notification Bell
├─ Open dropdown panel
│
├─ Load notifications:
│  GET /api/notifications?page=1&limit=10
│  
│  Response:
│  {
│    "notifications": [
│      {
│        "id": "notif1",
│        "type": "assigned",
│        "title": "You were assigned to issue #123",
│        "message": "John assigned you to 'Fix login bug'",
│        "issueId": "issue_id",
│        "isRead": false,
│        "createdAt": "2026-03-03T15:30:00Z"
│      },
│      {
│        "id": "notif2",
│        "type": "mention",
│        "title": "You were mentioned in issue #456",
│        "message": "@you what do you think?",
│        "issueId": "issue_id2",
│        "isRead": false,
│        "createdAt": "2026-03-03T14:20:00Z"
│      },
│      ...
│    ],
│    "pagination": { ... }
│  }
│
├─ Display notifications:
│  For each notification:
│  - Icon based on type
│  - Title and message
│  - Time ago (e.g., "2 hours ago")
│  - Unread indicator (blue dot)
│  - Click → Navigate to related issue
│
└─ Panel actions:
   - "Mark all as read" button
   - "View all" link → /notifications page
   - Individual mark as read (click on notification)
```

**API Endpoint:**
- `GET /api/notifications` - List notifications
  - Query params: `isRead`, `type`, `page`, `limit`

---

### 8.3 Mark Notification as Read

```
User Clicks on Notification
├─ PATCH /api/notifications/{notif_id}/read
│  
│  Response (200):
│  {
│    "success": true,
│    "notification": { ..., "isRead": true }
│  }
│  
│  Frontend Actions:
│  1. Remove blue dot / unread indicator
│  2. Decrement unread count badge
│  3. Navigate to: /issues/{issueId} (if has issueId)
│
└─ Mark all as read:
   PATCH /api/notifications/read-all
   
   Response (200):
   → Remove all blue dots
   → Set badge count to 0
```

**API Endpoints:**
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

---

### 8.4 Notifications Page (Full View)

```
User Navigates to /notifications
├─ Load full list with filters:
│  GET /api/notifications?page=1&limit=20
│  
│  Display with filter options:
│  - All / Unread only
│  - By type: assigned, mention, comment, status_change, etc.
│  - Pagination
│
├─ Actions:
│  - Mark all as read
│  - Delete all read notifications
│  - Delete individual notification
│
├─ Delete read notifications:
│  DELETE /api/notifications/read
│  → Remove all read items from list
│
└─ Delete individual:
   DELETE /api/notifications/{notif_id}
   → Remove from list
```

**API Endpoints:**
- `GET /api/notifications` - List notifications
- `DELETE /api/notifications/read` - Delete all read
- `DELETE /api/notifications/:id` - Delete single notification

---

## 9. Analytics/Reports Flow

### 9.1 Analytics Dashboard

```
User Navigates to /analytics
├─ Load overview:
│  GET /api/analytics/dashboard
│  
│  Response:
│  {
│    "totalIssues": 234,
│    "openIssues": 123,
│    "closedIssues": 111,
│    "averageCloseTime": 5.2,  // days
│    "issuesByPriority": {
│      "P0": 12,
│      "P1": 34,
│      "P2": 67,
│      "P3": 10
│    },
│    "recentActivity": [
│      {
│        "action": "issue_created",
│        "issue": { "number": 123, "title": "..." },
│        "user": { "name": "John" },
│        "timestamp": "2026-03-03T15:30:00Z"
│      },
│      ...
│    ],
│    "topRepositories": [
│      {
│        "repository": { "name": "react", "fullName": "facebook/react" },
│        "openIssues": 45,
│        "closedIssues": 234
│      },
│      ...
│    ]
│  }
│
└─ Display widgets:
   - Total issues card
   - Open vs Closed chart (pie/donut)
   - Average close time card
   - Issues by priority (bar chart)
   - Recent activity timeline
   - Top repositories table
```

**API Endpoint:**
- `GET /api/analytics/dashboard` - Dashboard overview

---

### 9.2 Issues by Status Report

```
Widget/Report: Issues Distribution by Status
└─ GET /api/analytics/issues-by-status
   
   Optional filters:
   - ?repository={repo_id}
   - ?startDate=2026-01-01&endDate=2026-03-03
   
   Response:
   {
     "byState": {
       "open": 123,
       "closed": 111
     },
     "byPriority": {
       "P0": 12,
       "P1": 34,
       "P2": 67,
       "P3": 10
     },
     "byCustomStatus": {
       "Backlog": 25,
       "In Progress": 15,
       "Done": 111,
       "Blocked": 3
     }
   }
   
   → Render multiple charts:
   - Pie chart for state distribution
   - Bar chart for priority distribution
   - Horizontal bar for custom statuses
```

**API Endpoint:**
- `GET /api/analytics/issues-by-status` - Issues grouped by status

---

### 9.3 Issues by Repository Report

```
Widget/Report: Repository Breakdown
└─ GET /api/analytics/issues-by-repo
   
   Response:
   {
     "repositories": [
       {
         "repository": {
           "id": "repo1",
           "name": "react",
           "fullName": "facebook/react"
         },
         "totalIssues": 150,
         "openIssues": 45,
         "closedIssues": 105,
         "completionRate": 70.0
       },
       {
         "repository": {
           "id": "repo2",
           "name": "vue",
           "fullName": "vuejs/vue"
         },
         "totalIssues": 84,
         "openIssues": 28,
         "closedIssues": 56,
         "completionRate": 66.7
       },
       ...
     ]
   }
   
   → Render:
   - Table with repository stats
   - Bar chart comparing repositories
   - Completion rate gauge per repo
```

**API Endpoint:**
- `GET /api/analytics/issues-by-repo` - Issues grouped by repository

---

### 9.4 Issues Over Time Report

```
Widget/Report: Issue Timeline
└─ GET /api/analytics/issues-over-time?days=30
   
   Optional params:
   - days (default: 30)
   - repository={repo_id}
   
   Response:
   {
     "timeline": [
       {
         "date": "2026-02-01",
         "created": 12,
         "closed": 8,
         "netChange": 4
       },
       {
         "date": "2026-02-02",
         "created": 15,
         "closed": 10,
         "netChange": 5
       },
       ...
     ],
     "summary": {
       "totalCreated": 234,
       "totalClosed": 189,
       "netChange": 45
     }
   }
   
   → Render:
   - Line chart with 2 lines (created vs closed)
   - Area chart showing net change
   - Summary cards at top
```

**API Endpoint:**
- `GET /api/analytics/issues-over-time` - Timeline of issues
  - Query params: `days`, `repository`

---

### 9.5 Assignee Workload Report

```
Widget/Report: Team Workload
└─ GET /api/analytics/assignee-workload
   
   Optional params:
   - ?repository={repo_id}
   
   Response:
   {
     "workload": [
       {
         "assignee": {
           "id": "user1",
           "name": "John Doe",
           "githubLogin": "johndoe",
           "avatar": "https://..."
         },
         "totalIssues": 23,
         "openIssues": 15,
         "closedIssues": 8,
         "issuesByPriority": {
           "P0": 2,
           "P1": 8,
           "P2": 4,
           "P3": 1
         }
       },
       ...
     ],
     "unassigned": 12
   }
   
   → Render:
   - Table with assignee stats
   - Horizontal bar chart (issues per person)
   - Priority breakdown per person
   - Alert if someone has too many P0/P1 issues
```

**API Endpoint:**
- `GET /api/analytics/assignee-workload` - Assignee workload

---

### 9.6 Completion Rate Report

```
Widget/Report: Completion Metrics
└─ GET /api/analytics/completion-rate
   
   Optional params:
   - ?repository={repo_id}
   - ?startDate=2026-01-01&endDate=2026-03-03
   
   Response:
   {
     "overall": {
       "totalIssues": 234,
       "closedIssues": 111,
       "completionRate": 47.4,
       "averageTimeToClose": 5.2  // days
     },
     "byRepository": [
       {
         "repository": { "name": "react", ... },
         "totalIssues": 150,
         "closedIssues": 105,
         "completionRate": 70.0,
         "averageTimeToClose": 4.8
       },
       ...
     ]
   }
   
   → Render:
   - Overall completion rate gauge
   - Average time to close card
   - Per-repository comparison table
   - Trend indicators (↑↓)
```

**API Endpoint:**
- `GET /api/analytics/completion-rate` - Completion rate metrics

---

## 10. Settings & Profile Flow

### 10.1 Load User Settings

```
User Navigates to /settings/profile
└─ GET /api/settings
   
   Response:
   {
     "id": "user_id",
     "email": "user@example.com",
     "name": "John Doe",
     "githubLogin": "johndoe",
     "githubId": 168978537,
     "avatar": "https://avatars.githubusercontent.com/...",
     "bio": "Full-stack developer",
     "location": "San Francisco, CA",
     "company": "Acme Inc",
     "website": "https://johndoe.com",
     "createdAt": "2026-01-15T10:00:00Z"
   }
   
   → Pre-fill form with user data
```

**API Endpoint:**
- `GET /api/settings` - Get user settings/profile

---

### 10.2 Update User Profile

```
User Edits Profile Information
├─ User modifies fields:
│  - Name: "John Doe" → "John Smith"
│  - Bio: Updated bio text
│  - Location, company, website
│
└─ Submit form:
   PUT /api/settings
   Body: {
     "name": "John Smith",
     "bio": "Senior full-stack developer passionate about open source",
     "location": "Austin, TX",
     "company": "Tech Corp",
     "website": "https://johnsmith.dev"
   }
   
   Success Response (200):
   {
     "success": true,
     "user": {
       "id": "...",
       "name": "John Smith",
       "bio": "Senior full-stack developer...",
       ...
     }
   }
   
   Frontend Actions:
   1. Update global user state
   2. Update UI with new info
   3. Show toast: "Profile updated successfully"
```

**API Endpoint:**
- `PUT /api/settings` - Update user settings/profile

---

### 10.3 Milestones Management

```
User Navigates to /milestones
├─ Load milestones:
│  GET /api/milestones?page=1&limit=20
│  
│  Optional filters:
│  - ?state=open
│  - ?state=closed
│  - ?repository={repo_id}
│  
│  Response:
│  {
│    "milestones": [
│      {
│        "id": "milestone1",
│        "title": "v1.0 Release",
│        "state": "open",
│        "dueOn": "2026-04-01T00:00:00Z",
│        "githubNumber": 1,
│        "githubUrl": "https://github.com/...",
│        "repository": { "id": "...", "name": "react" },
│        "openIssues": 12,
│        "closedIssues": 45,
│        "progress": 78.9
│      },
│      ...
│    ],
│    "pagination": { ... }
│  }
│
├─ Create milestone:
│  POST /api/milestones
│  Body: {
│    "title": "v2.0 Release",
│    "repositoryId": "repo_id",
│    "state": "open",
│    "dueOn": "2026-06-01T00:00:00Z"
│  }
│  → Add to list
│
└─ Filter by state/repository:
   GET /api/milestones?state=open&repository={repo_id}
   → Update list
```

**API Endpoints:**
- `GET /api/milestones` - List milestones
  - Query params: `state`, `repository`, `page`, `limit`
- `POST /api/milestones` - Create milestone

---

### 10.4 Activity Log

```
User Navigates to /activity
└─ GET /api/activity-log?page=1&limit=20
   
   Response:
   {
     "activities": [
       {
         "id": "act1",
         "action": "issue_created",
         "description": "Created issue #123: Fix login bug",
         "issueId": "issue_id",
         "repositoryId": "repo_id",
         "metadata": {
           "issueNumber": 123,
           "issueTitle": "Fix login bug"
         },
         "timestamp": "2026-03-03T15:30:00Z"
       },
       {
         "id": "act2",
         "action": "issue_updated",
         "description": "Updated issue #122: priority changed to P0",
         "issueId": "issue_id2",
         "timestamp": "2026-03-03T14:20:00Z"
       },
       ...
     ],
     "pagination": { ... }
   }
   
   → Render timeline:
   - Icon per action type
   - Description text
   - Time ago
   - Link to related issue/repository
```

**API Endpoint:**
- `GET /api/activity-log` - Get user activity log
  - Query params: `page`, `limit`

---

## 11. Error Handling & Edge Cases

### 11.1 Authentication Errors

```
API Response: 401 Unauthorized
{
  "error": "Invalid or expired token"
}

Frontend Actions:
1. Clear token from localStorage
2. Clear user state from Redux/Context
3. Show toast: "Session expired. Please login again."
4. Redirect to /login
```

---

### 11.2 Validation Errors

```
API Response: 400 Bad Request
{
  "error": "Validation failed",
  "details": [
    { "field": "title", "message": "Title is required" },
    { "field": "color", "message": "Valid 6-char hex color required" }
  ]
}

Frontend Actions:
1. Show inline error messages on form fields
2. Highlight invalid fields in red
3. Keep modal/form open for correction
4. Don't show generic error toast (field-specific errors are enough)
```

---

### 11.3 Rate Limiting

```
API Response: 429 Too Many Requests
{
  "error": "Too many requests from this IP, please try again later."
}

Frontend Actions:
1. Show error toast: "You're sending too many requests. Please wait a moment."
2. Disable action buttons for 30 seconds
3. Show countdown timer if possible
4. Log to console for debugging
```

---

### 11.4 Server Errors

```
API Response: 500 Internal Server Error
{
  "error": "An unexpected error occurred. Please try again."
}

Frontend Actions:
1. Show error toast: "Something went wrong. Please try again."
2. Add "Retry" button in toast
3. Log full error to console/error tracking service
4. Don't clear user data/state
5. Keep UI in previous valid state
```

---

### 11.5 Network Errors

```
Network Failure / No Response
(Cannot connect to server)

Frontend Actions:
1. Detect network error (axios.catch with no response)
2. Show persistent error banner: "No internet connection"
3. Retry automatically every 10 seconds
4. Allow manual retry button
5. Queue mutations for retry when connection restored
6. Show "Offline" indicator in header
```

---

### 11.6 Not Found Errors

```
API Response: 404 Not Found
{
  "error": "Issue not found"
}

Frontend Actions:
For detail pages (/issues/:id):
1. Show 404 page: "Issue not found"
2. Provide link back to issues list
3. Suggest similar/related items if possible

For list endpoints:
1. Return empty state: "No issues found"
2. Show helpful message with action buttons
3. Don't treat as error (just empty result)
```

---

### 11.7 GitHub API Errors

```
Sync Operation Failure

API Response: 500
{
  "error": "GitHub API rate limit exceeded. Try again in 30 minutes."
}

Frontend Actions:
1. Show specific error in toast
2. Display rate limit info if available
3. Disable "Sync" button temporarily
4. Show "Next sync available at: 15:30" countdown
5. Suggest using webhooks to avoid rate limits
```

---

### 11.8 Permission Errors

```
API Response: 403 Forbidden
{
  "error": "You don't have permission to access this repository"
}

Frontend Actions:
1. Show error toast with explanation
2. Redirect to appropriate page (e.g., repositories list)
3. Log error for debugging
4. Don't show deleted/inaccessible resources in lists
```

---

## 📊 Quick Reference: API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/github` | Initiate OAuth |
| GET | `/api/auth/github/callback` | OAuth callback |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Logout |

### Repositories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/repositories` | List repositories |
| POST | `/api/repositories` | Add repository |
| GET | `/api/repositories/:id` | Get repository |
| PATCH | `/api/repositories/:id` | Update repository |
| DELETE | `/api/repositories/:id` | Delete repository |
| POST | `/api/repositories/:id/sync` | Sync issues |
| POST | `/api/repositories/:id/webhook` | Setup webhook |

### Issues
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/issues` | List issues |
| POST | `/api/issues` | Create issue |
| GET | `/api/issues/:id` | Get issue |
| PATCH | `/api/issues/:id` | Update issue |
| DELETE | `/api/issues/:id` | Delete issue |
| POST | `/api/issues/:id/categories` | Assign categories |
| DELETE | `/api/issues/:id/categories/:categoryId` | Remove category |

### Labels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/labels` | List labels |
| POST | `/api/labels` | Create label |
| GET | `/api/labels/:id` | Get label |
| PUT | `/api/labels/:id` | Update label |
| DELETE | `/api/labels/:id` | Delete label |
| POST | `/api/labels/sync/:repoId` | Sync from GitHub |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| PATCH | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Views
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/views` | List saved views |
| POST | `/api/views` | Create view |
| PATCH | `/api/views/:id` | Update view |
| DELETE | `/api/views/:id` | Delete view |
| POST | `/api/views/:id/apply` | Apply view |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| GET | `/api/notifications/unread-count` | Unread count |
| GET | `/api/notifications/:id` | Get notification |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |
| DELETE | `/api/notifications/read` | Delete all read |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard overview |
| GET | `/api/analytics/issues-by-status` | Group by status |
| GET | `/api/analytics/issues-by-repo` | Group by repository |
| GET | `/api/analytics/issues-over-time` | Timeline |
| GET | `/api/analytics/assignee-workload` | Workload |
| GET | `/api/analytics/completion-rate` | Completion metrics |

### Additional
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (public) |
| GET | `/api/milestones` | List milestones |
| POST | `/api/milestones` | Create milestone |
| GET | `/api/settings` | Get user settings |
| PUT | `/api/settings` | Update settings |
| GET | `/api/activity-log` | Activity log |

---

## 🎯 Best Practices

### 1. **Token Management**
- Store JWT in secure storage (httpOnly cookie or encrypted localStorage)
- Include token in all authenticated requests: `Authorization: Bearer ${token}`
- Refresh token proactively (before expiry)
- Clear token immediately on logout/401 errors

### 2. **Loading States**
- Show loading indicators for all async operations
- Use skeleton screens for initial page loads
- Disable buttons during API calls to prevent duplicate requests
- Show progress for long operations (sync, webhook setup)

### 3. **Error Handling**
- Always catch API errors and show user-friendly messages
- Provide retry options for failed requests
- Log errors to console/monitoring service
- Handle network errors gracefully (offline mode)

### 4. **Performance**
- Make parallel API calls when possible (dashboard load)
- Implement pagination for large lists
- Cache frequently accessed data (user profile, repositories)
- Debounce search inputs (300-500ms)
- Use optimistic updates for better perceived performance

### 5. **User Experience**
- Show success toasts for completed actions
- Confirm destructive actions (delete issue, delete repository)
- Auto-save drafts for long forms
- Preserve scroll position when navigating back
- Update UI immediately (optimistic updates), then sync with server

### 6. **Data Freshness**
- Refresh dashboard data every 5 minutes (optional)
- Poll for new notifications every 30 seconds
- Show "Last synced: X minutes ago" for repositories
- Provide manual refresh buttons where appropriate

### 7. **Accessibility**
- Use semantic HTML
- Provide keyboard navigation
- Add ARIA labels for screen readers
- Show loading states for assistive technologies
- Ensure color contrast meets WCAG standards

---

## 🔄 Common User Journeys

### Journey 1: New User Setup
1. Login with GitHub → `/api/auth/github`
2. Add first repository → `POST /api/repositories`
3. Sync issues → `POST /api/repositories/:id/sync`
4. Create categories → `POST /api/categories` (3x)
5. View dashboard → `GET /api/analytics/dashboard`

### Journey 2: Daily Issue Management
1. Load dashboard → `GET /api/analytics/dashboard`
2. Check notifications → `GET /api/notifications/unread-count`
3. Apply saved view → `POST /api/views/:id/apply`
4. Update issue priority → `PATCH /api/issues/:id`
5. Close completed issue → `PATCH /api/issues/:id` (state: closed)

### Journey 3: Weekly Review
1. View analytics → `GET /api/analytics/dashboard`
2. Check completion rate → `GET /api/analytics/completion-rate`
3. Review team workload → `GET /api/analytics/assignee-workload`
4. Check issues over time → `GET /api/analytics/issues-over-time?days=7`
5. Sync all repositories → `POST /api/repositories/:id/sync` (for each repo)

---

**This document provides complete API integration guidance for DevFlow. For detailed API schemas and parameters, refer to the Swagger docs at `/api-docs`.**
