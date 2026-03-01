# DevFlow Backend

GitHub Project Dashboard Backend API built with Node.js, Express, TypeScript, and Prisma.

## ⚡ Project Status

✅ **52 Endpoints Implemented** | ✅ **Swagger Documentation** | ✅ **Production Ready**

- 🔐 Authentication with GitHub OAuth & JWT
- 📦 Complete Repository Management (7 endpoints)
- 🎯 Full Issue Management System (12 endpoints)
- 🏷️ Complete Label Management (6 endpoints)
- 🗂️ Category Management (6 endpoints)
- 🔍 Saved Views & Filters (5 endpoints)
- 📊 Analytics & Insights (6 endpoints)
- 🔔 Notification System (5 endpoints)
- 🔥 Interactive API Documentation (Swagger UI)
- 🛡️ Security: Helmet, CORS, Rate Limiting
- ✅ Input Validation & Error Handling

## 🎯 Quick Links

Once running, access:
- **Swagger UI**: http://localhost:3001/api-docs
- **OpenAPI JSON**: http://localhost:3001/api-docs.json
- **Health Check**: http://localhost:3001/api/health

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 15+ installed and running
- GitHub OAuth App created

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and GitHub OAuth keys
   ```

3. **Setup Database**
   ```bash
   # Create database (in PostgreSQL)
   createdb devflow_db
   
   # Run Prisma migrations
   npm run prisma:migrate
   
   # Generate Prisma Client
   npm run prisma:generate
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

Server will start at `http://localhost:3001`

## 🎯 Quick Access

Once the server is running:

- **🏠 Server**: http://localhost:3001
- **🔥 Swagger UI**: http://localhost:3001/api-docs (Interactive API documentation)
- **📋 OpenAPI JSON**: http://localhost:3001/api-docs.json
- **🏥 Health Check**: http://localhost:3001/api/health

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (DB GUI)

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── repository.controller.ts
│   │   ├── issue.controller.ts
│   │   ├── label.controller.ts
│   │   ├── category.controller.ts
│   │   ├── views.controller.ts
│   │   ├── analytics.controller.ts
│   │   └── notification.controller.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── repository.routes.ts
│   │   ├── issue.routes.ts
│   │   ├── label.routes.ts
│   │   ├── category.routes.ts
│   │   ├── views.routes.ts
│   │   ├── analytics.routes.ts
│   │   └── notification.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── repository.service.ts
│   │   ├── issue.service.ts
│   │   ├── label.service.ts
│   │   ├── category.service.ts
│   │   ├── views.service.ts
│   │   ├── analytics.service.ts
│   │   └── notification.service.ts
│   ├── models/
│   │   ├── auth.model.ts
│   │   ├── issue.model.ts
│   │   ├── label.model.ts
│   │   ├── repository.model.ts
│   │   ├── user.model.ts
│   │   └── notification.model.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   └── index.ts                # App entry point
├── prisma/
│   └── schema.prisma           # Database schema
├── .env                        # Environment variables (not committed)
├── .env.example                # Environment template
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

## 🔐 Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `GITHUB_CLIENT_ID` - GitHub OAuth Client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth Secret
- `JWT_SECRET` - Secret key for JWT tokens

## 📚 API Documentation

### Interactive Documentation (Swagger UI)

Access the interactive API documentation at **http://localhost:3001/api-docs** when the server is running.

**Features:**
- 🔥 Try out APIs directly from the browser
- 📖 Complete request/response schemas
- 🔐 Built-in authentication support
- 📋 52 implemented endpoints across 8 categories

### Implemented Endpoints

#### 🔐 Authentication (5 endpoints)
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

#### 📦 Repositories (7 endpoints)
- `GET /api/repositories` - List all repositories
- `POST /api/repositories` - Add repository
- `GET /api/repositories/:id` - Get repository
- `PATCH /api/repositories/:id` - Update repository
- `DELETE /api/repositories/:id` - Delete repository
- `POST /api/repositories/:id/sync` - Sync with GitHub
- `POST /api/repositories/:id/webhook` - Setup webhook

#### 🎯 Issues (12 endpoints)
- `GET /api/issues` - List issues with filters (`state`, `priority`, `label`, `search`, `sort`, `page`, `limit`)
- `GET /api/issues/:id` - Get single issue with details
- `POST /api/issues` - Create issue
- `PATCH /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Close issue
- `POST /api/issues/bulk` - Bulk operations (close, label, assign, priority, category)
- `POST /api/issues/:id/assign` - Assign users
- `POST /api/issues/:id/labels` - Add/remove/set labels
- `GET /api/issues/:id/comments` - Get comments
- `POST /api/issues/:id/comments` - Add comment
- `PATCH /api/issues/:id/comments/:commentId` - Edit comment
- `DELETE /api/issues/:id/comments/:commentId` - Delete comment

#### 🏷️ Labels (6 endpoints)
- `GET /api/repositories/:repoId/labels` - Get repository labels
- `POST /api/repositories/:repoId/labels` - Create label
- `PATCH /api/labels/:id` - Update label
- `DELETE /api/labels/:id` - Delete label
- `GET /api/labels` - Get all labels across repos
- `GET /api/labels/popular` - Get most used labels

#### 🗂️ Categories (6 endpoints)
- `GET /api/categories` - Get all user categories
- `POST /api/categories` - Create category
- `PATCH /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `POST /api/issues/:id/categories` - Assign categories to issue
- `DELETE /api/issues/:id/categories/:categoryId` - Remove category from issue

#### 🔍 Saved Views & Filters (5 endpoints)
- `GET /api/views` - Get all saved views
- `POST /api/views` - Create a saved view (with filter preset)
- `PATCH /api/views/:id` - Update saved view
- `DELETE /api/views/:id` - Delete saved view
- `POST /api/views/:id/apply` - Apply view (returns filtered issues)

#### 📊 Analytics (6 endpoints)
- `GET /api/analytics/dashboard` - Dashboard overview (totals, priorities)
- `GET /api/analytics/issues-by-status` - Issues grouped by state & custom status
- `GET /api/analytics/issues-by-repo` - Issues grouped by repository
- `GET /api/analytics/issues-over-time` - Timeline chart (created vs closed)
- `GET /api/analytics/assignee-workload` - Workload per assignee
- `GET /api/analytics/completion-rate` - Completion rate overall & per repo

#### 🔔 Notifications (5 endpoints)
- `GET /api/notifications` - Get notifications (`?isRead=`, `?type=`, `?page=`, `?limit=`)
- `GET /api/notifications/unread-count` - Get unread badge count
- `GET /api/notifications/:id` - Get single notification
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read

### Additional Documentation

- 📋 **Postman Collection**: `Docs/Postman_Collection.json`
- 📖 **Detailed API Docs**: `Docs/API_DOCUMENTATION.md`
- 🗄️ **Database Schema**: `Docs/SCHEMA_EXPLAINED.md`

## ❗ Common Issues & Solutions

### Issue Creation (422 Error)

If you get a `422` error when creating issues, it's typically because:

1. **Invalid assignees**: GitHub usernames don't exist or lack repository access
2. **Invalid labels**: Label names don't exist in the repository (create them first via GitHub UI)
3. **Invalid milestone**: Milestone doesn't exist in the repository

**Solution**: Start with a basic issue (title + body only), then add labels/assignees that exist in your repository.

**Example working request:**
```json
{
  "repositoryId": "your-repo-id",
  "title": "Test Issue",
  "body": "Issue description"
}
```

### Swagger UI Caching

If Swagger UI shows old data or pet store demo:

1. **Hard refresh**: Press `Ctrl+Shift+R` or `Ctrl+F5`
2. **Clear cache**: DevTools (F12) → Network → Disable cache
3. **Incognito mode**: Open in private browsing window

### Database Connection

If you see database connection errors:

```bash
# Check PostgreSQL is running
pg_isready

# Restart PostgreSQL service
# Windows:
net start postgresql-x64-18
# Linux/Mac:
sudo service postgresql restart
```

## 🆕 Recent Updates

### v1.3.0 - Current Release

✅ **Notification System (5 endpoints)**
- Get all notifications with filters (isRead, type, pagination)
- Unread count for badge display
- Get single notification by ID
- Mark single notification as read
- Mark all notifications as read
- Tested and verified all endpoints ✅

### v1.2.0

✅ **Analytics API (6 endpoints)**
- Dashboard overview with totals and priority breakdown
- Issues grouped by status and custom status
- Issues grouped by repository with open/closed counts
- 30-day timeline chart (created vs closed)
- Assignee workload distribution
- Completion rate overall and per repository

✅ **Saved Views & Filters API (5 endpoints)**
- Create named filter presets (state, priority, label, repo, search, sort)
- Update and delete saved views
- Apply a saved view to get filtered issues with pagination
- Support for default view setting

### v1.1.0

✅ **Category Management (6 endpoints)**
- Create, update, delete user categories with hex color
- Assign categories to issues
- Remove categories from issues

✅ **Full Comments API (built into Issues)**
- Get, add, edit, delete comments
- Assign users to issues
- Manage issue labels (add/remove/set)

### v1.0.0

✅ **Foundation**
- Full Issue Management API (12 endpoints)
- Label Management API (6 endpoints)
- Repository Management API (7 endpoints)
- GitHub OAuth + JWT Authentication (5 endpoints)
- Swagger UI with all endpoints documented
- Helmet, CORS, Rate Limiting, Input Validation

## 🧪 Testing

```bash
npm test
```

## 📦 Database

Using Prisma ORM with PostgreSQL. See `prisma/schema.prisma` for the complete data model.

### Useful Prisma Commands

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# View database in browser
npx prisma studio
```

## 🔧 Development

The server uses nodemon for hot reloading during development. Any changes to `.ts` files will automatically restart the server.

## 🚢 Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Set environment variables in your hosting platform

3. Run migrations:
   ```bash
   npm run prisma:migrate
   ```

4. Start the server:
   ```bash
   npm start
   ```

## 📝 License

MIT
