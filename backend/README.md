# DevFlow Backend

GitHub Project Dashboard Backend API built with Node.js, Express, TypeScript, and Prisma.

## ⚡ Project Status

✅ **24 Endpoints Implemented** | ✅ **Swagger Documentation** | ✅ **Production Ready**

- 🔐 Authentication with GitHub OAuth & JWT
- 📦 Complete Repository Management (7 endpoints)
- 🎯 Full Issue Management System (12 endpoints)
- 🔥 Interactive API Documentation (Swagger UI)
- 🛡️ Security: Helmet, CORS, Rate Limiting
- ✅ Input Validation & Error Handling

## 🎯 Quick Links

Once running, access:
- **Swagger UI**: http://localhost:5000/api-docs
- **OpenAPI JSON**: http://localhost:5000/api-docs.json
- **Health Check**: http://localhost:5000/api/health

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

Server will start at `http://localhost:5000`

## 🎯 Quick Access

Once the server is running:

- **🏠 Server**: http://localhost:5000
- **🔥 Swagger UI**: http://localhost:5000/api-docs (Interactive API documentation)
- **📋 OpenAPI JSON**: http://localhost:5000/api-docs.json
- **🏥 Health Check**: http://localhost:5000/api/health

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
│   ├── controllers/     # Request handlers
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Helper functions
│   └── index.ts        # App entry point
├── prisma/
│   └── schema.prisma   # Database schema
├── .env                # Environment variables (not committed)
├── .env.example        # Environment template
├── tsconfig.json       # TypeScript config
└── package.json        # Dependencies
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

Access the interactive API documentation at **http://localhost:5000/api-docs** when the server is running.

**Features:**
- 🔥 Try out APIs directly from the browser
- 📖 Complete request/response schemas
- 🔐 Built-in authentication support
- 📋 24 implemented endpoints across 3 categories

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
- `GET /api/issues` - List issues with filters
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create issue
- `PATCH /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Close issue
- `POST /api/issues/bulk` - Bulk operations
- `POST /api/issues/:id/assign` - Assign users
- `POST /api/issues/:id/labels` - Manage labels
- `GET /api/issues/:id/comments` - Get comments
- `POST /api/issues/:id/comments` - Add comment
- `PATCH /api/issues/:id/comments/:commentId` - Edit comment
- `DELETE /api/issues/:id/comments/:commentId` - Delete comment

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

### v1.0.0 - Current Release

✅ **Completed Features:**
- Full Issue Management API (12 endpoints)
  - Create, read, update, close issues
  - Advanced filtering and pagination
  - Bulk operations support
  - Comment CRUD operations
  - Label and assignee management
  
- Enhanced Error Handling
  - Detailed GitHub API error messages
  - 422 validation error specifics
  - Improved debugging information
  
- Complete Swagger Documentation
  - All 24 endpoints documented
  - Interactive testing interface
  - Request/response schemas
  - Authentication integration

- Improved GitHub Integration
  - Better data cleaning before API calls
  - Validation for assignees and labels
  - Detailed error messages for API failures
  - Optimized sync operations

**Bug Fixes:**
- Fixed TypeScript BigInt conversion issues
- Resolved ts-node type declaration loading
- Fixed Swagger UI caching issues
- Improved GitHub 422 error handling with detailed messages

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
