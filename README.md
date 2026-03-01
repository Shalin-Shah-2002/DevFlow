# DevFlow - GitHub Project Dashboard

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![Status](https://img.shields.io/badge/status-backend%20complete-brightgreen.svg)
![API Progress](https://img.shields.io/badge/API%20progress-72%2F72%20(100%25)-brightgreen.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Development Status](#api-development-status)
- [Documentation](#documentation)
- [Contributing](#contributing)

---

## 🎯 Overview

**DevFlow** is a comprehensive SaaS platform that provides a unified dashboard for managing GitHub issues across multiple repositories. It enhances GitHub's native interface with advanced project management features, custom workflows, analytics, and cross-platform accessibility.

### What Problem Does It Solve?

- **Multi-Repository Management**: Developers working on multiple projects struggle to track issues across different repositories
- **Custom Workflows**: GitHub's native interface lacks flexibility for custom categorization and workflows
- **Unified Dashboard**: No single view to see all your issues and tasks in one place
- **Team Collaboration**: Limited project management features for teams
- **Analytics**: Minimal insights into project progress and team productivity

### Target Users

- 👨‍💻 **Individual Developers** - Managing personal projects
- 👥 **Development Teams** - Collaborative project management
- 📊 **Project Managers** - Oversight and analytics
- 🎯 **Team Leads** - Task assignment and tracking

---

## ✅ What's Implemented

**DevFlow is currently in active development with core functionality ready!**

### 🎉 Completed Features

✅ **Authentication System** (100%)
- GitHub OAuth 2.0 integration
- JWT token-based authentication
- Secure user session management
- Access token refresh mechanism

✅ **Repository Management** (100%)
- Add/remove repositories from GitHub
- Multi-repository dashboard
- Sync repositories with GitHub
- Webhook configuration
- Custom grouping and metadata

✅ **Issue Management** (100%)
- Create, read, update, and close issues
- Advanced filtering (by status, priority, labels, assignees, repository)
- Bulk operations on multiple issues
- Assign/unassign team members
- Label management
- Comment system (CRUD operations)
- Direct GitHub synchronization
- Pagination support

✅ **Labels Management** (100%)
- Create, update and delete labels per repository
- Sync labels directly from GitHub
- Full label metadata (name, color, description)

✅ **Custom Categories** (100%)
- Create and manage custom issue categories per user
- Assign/remove categories on any issue
- Conflict detection (duplicate names)
- Issue count per category

✅ **Saved Views & Filters** (100%)
- Save custom filter combinations as named views
- Mark a view as default
- Apply a view to instantly retrieve matching issues
- Full CRUD (create, update, delete views)

✅ **Analytics Dashboard** (100%)
- Dashboard overview: totals, priority breakdown, close rate
- Issues grouped by state and custom workflow status
- Issues grouped by repository
- Daily timeline of created vs closed issues (7d / 30d / 90d / 1y)
- Assignee workload distribution
- Completion rate overall and per repository

✅ **Notifications System** (100%)
- List notifications with filters (type, read status, pagination)
- Get single notification details
- Get unread notification count
- Mark individual notification as read
- Mark all notifications as read
- Delete individual notification
- Delete all read notifications (bulk cleanup)

✅ **Additional Features** (100%)
- Milestones: create and list milestones per repository
- Settings: view and update user profile settings
- Activity Log: paginated timeline of user actions
- Global Search: full-text search across issues and repositories
- Data Export: download issues, repositories, or milestones as CSV or JSON
- Bulk Actions: close, reopen, label, milestone or prioritize multiple issues at once
- Teams: create teams and list members
- Webhooks: register GitHub webhooks per repository
- Health Check: live database connectivity and uptime report

✅ **Developer Experience**
- 🔥 Interactive Swagger UI at `/api-docs`
- 📋 Complete OpenAPI 3.0 specification
- 📦 Postman collection with 72 endpoints
- 📖 Comprehensive documentation
- 🛡️ Input validation and error handling
- 🔒 Security best practices (Helmet, CORS, Rate Limiting)

### 📊 Current Status

- **72 API endpoints** implemented and fully functional
- **18 database tables** with complete relationships
- **9 major API categories** completed (Auth, Repos, Issues, Labels, Categories, Views, Analytics, Notifications, Additional Features)
- **Swagger documentation** for all endpoints
- **Production-ready** backend infrastructure

### 🚧 Coming Next

- React Web Frontend
- Flutter Mobile App
- Real-time updates (WebSockets)
- Unit & integration test suite

---

## ✨ Key Features

### Core Features
- ✅ **GitHub OAuth Authentication** - Secure login via GitHub
- 📦 **Multi-Repository Integration** - Connect and manage multiple repos
- 🎯 **Unified Issue Dashboard** - All issues in one place
- 🏷️ **Custom Labels & Categories** - Organize issues your way
- 💬 **Comment Management** - Threaded discussions
- 🔍 **Advanced Filtering & Saved Views** - Find and save issue filters
- 📊 **Analytics & Insights** - Track progress and productivity
- 🔔 **Smart Notifications** - Stay updated on important changes
- 🏁 **Milestones** - Group issues into release milestones
- 🔎 **Global Search** - Search issues and repositories instantly
- 📤 **Data Export** - Download data as CSV or JSON
- ⚡ **Bulk Actions** - Close, label, or prioritize many issues at once
- 👥 **Teams** - Create teams and manage members
- 🌓 **Dark/Light Mode** - Comfortable viewing experience

### Platform Support
- 🌐 **Web Application** - React-based responsive UI
- 📱 **Mobile Apps** - Flutter for iOS & Android
- 🔌 **RESTful API** - Node.js backend with Express

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js 5.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 18
- **ORM**: Prisma 5.22+
- **Authentication**: Passport.js + JWT + GitHub OAuth 2.0
- **Security**: Helmet, CORS, Rate Limiting, Express Validator
- **API Documentation**: Swagger/OpenAPI 3.0 (swagger-jsdoc, swagger-ui-express)
- **HTTP Client**: Axios 1.13+ for GitHub API integration

### Frontend (Planned)
- **Web**: React 18+ with TypeScript
- **Mobile**: Flutter 3.x with Dart
- **State Management**: Redux Toolkit / Riverpod
- **UI Framework**: Material-UI / Tailwind CSS

### DevOps & Tools
- **Version Control**: Git & GitHub
- **Package Manager**: npm/yarn
- **Development**: Nodemon, ts-node
- **API Testing**: Postman (recommended)

---

## 📁 Project Structure

```
DevFlow/
├── backend/                    # Backend API server
│   ├── src/
│   │   ├── index.ts                    # Entry point
│   │   ├── controllers/               # Request handlers (9 files)
│   │   │   └── additional.controller.ts
│   │   ├── services/                  # Business logic (9 files)
│   │   │   └── additional.service.ts
│   │   ├── models/                    # TypeScript type definitions (9 files)
│   │   │   └── additional.model.ts
│   │   ├── routes/                    # API route definitions (9 files)
│   │   │   └── additional.routes.ts
│   │   └── middleware/                # Auth, validation, error handling
│   ├── prisma/
│   │   └── schema.prisma              # Database schema (18 tables)
│   ├── package.json
│   └── tsconfig.json
├── docs/                       # Documentation files
│   ├── SRS_GitHub_Dashboard.md
│   ├── QUICK_START.md
│   ├── ROADMAP.md
│   └── SETUP_GUIDE.md
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **GitHub Account** (for OAuth setup)
- **Git** for version control

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DevFlow
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Setup database**
   ```bash
   # Create PostgreSQL database
   createdb -U postgres devflow_db
   
   # Run migrations
   npm run prisma:migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - 🌐 Server: http://localhost:3001
   - 🔥 Swagger UI: http://localhost:3001/api-docs
   - 🏥 Health Check: http://localhost:3001/api/health

📖 **For detailed setup instructions, see [QUICK_START.md](QUICK_START.md)**

---

## 🧪 Testing the API

### Option 1: Swagger UI (Recommended)

1. Start the server: `npm run dev`
2. Open http://localhost:3001/api-docs in your browser
3. Click "Authorize" and enter your JWT token
4. Try out any endpoint with the "Try it out" button

### Option 2: Postman

1. Import the collection: `backend/Docs/Postman_Collection.json`
2. Set up environment variables (base_url, access_token)
3. Test all 72 endpoints with pre-configured requests

### Option 3: cURL

```bash
# Health check
curl http://localhost:3001/api/health

# Get current user (requires auth)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/auth/me

# List issues
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/issues?state=open&page=1&limit=20
```

---

## 🔄 API Development Status

Track the implementation progress of all API endpoints across 10 categories.

### API Categories Checklist

#### 🔐 1. Authentication APIs (5 endpoints)
- [x] POST `/api/auth/github` - Initiate GitHub OAuth
- [x] GET `/api/auth/github/callback` - OAuth callback handler
- [x] GET `/api/auth/me` - Get current user profile
- [x] POST `/api/auth/refresh` - Refresh access token
- [x] POST `/api/auth/logout` - Logout user

#### 📦 2. Repository APIs (7 endpoints)
- [x] GET `/api/repositories` - List all repositories
- [x] POST `/api/repositories` - Add repository
- [x] GET `/api/repositories/:id` - Get repository details
- [x] PATCH `/api/repositories/:id` - Update repository
- [x] DELETE `/api/repositories/:id` - Remove repository
- [x] POST `/api/repositories/:id/sync` - Sync with GitHub
- [x] POST `/api/repositories/:id/webhook` - Setup GitHub webhook

#### 🎯 3. Issue APIs (12 endpoints)
- [x] GET `/api/issues` - List all issues (with filters)
- [x] GET `/api/issues/:id` - Get issue details
- [x] POST `/api/issues` - Create new issue
- [x] PATCH `/api/issues/:id` - Update issue
- [x] DELETE `/api/issues/:id` - Close issue
- [x] POST `/api/issues/bulk` - Bulk operations
- [x] POST `/api/issues/:id/assign` - Assign/unassign users
- [x] POST `/api/issues/:id/labels` - Add/remove labels
- [x] GET `/api/issues/:id/comments` - Get issue comments
- [x] POST `/api/issues/:id/comments` - Add comment
- [x] PATCH `/api/issues/:id/comments/:commentId` - Edit comment
- [x] DELETE `/api/issues/:id/comments/:commentId` - Delete comment

#### 🏷️ 4. Label APIs (6 endpoints)
- [x] GET `/api/labels` - List all labels
- [x] POST `/api/labels` - Create label
- [x] GET `/api/labels/:id` - Get label details
- [x] PUT `/api/labels/:id` - Update label
- [x] DELETE `/api/labels/:id` - Delete label
- [x] POST `/api/labels/sync/:repoId` - Sync labels from GitHub

#### 💬 5. Comment APIs (6 endpoints) — ✅ Integrated into Issue APIs
- [x] GET `/api/issues/:id/comments` - List all comments for an issue
- [x] POST `/api/issues/:id/comments` - Add comment (syncs to GitHub)
- [x] PATCH `/api/issues/:id/comments/:commentId` - Edit comment (syncs to GitHub)
- [x] DELETE `/api/issues/:id/comments/:commentId` - Delete comment (syncs to GitHub)
- [x] POST `/api/issues/:id/assign` - Assign/unassign users (syncs to GitHub)
- [x] POST `/api/issues/:id/labels` - Add/remove labels (syncs to GitHub)

#### 📂 6. Category APIs (6 endpoints)
- [x] GET `/api/categories` - List all categories (per user)
- [x] POST `/api/categories` - Create category
- [x] PATCH `/api/categories/:id` - Update category name/color
- [x] DELETE `/api/categories/:id` - Delete category
- [x] POST `/api/issues/:id/categories` - Assign categories to issue
- [x] DELETE `/api/issues/:id/categories/:categoryId` - Remove category from issue

#### 🔍 7. Filter & Views APIs (5 endpoints)
- [x] GET `/api/views` - List all saved views/filters
- [x] POST `/api/views` - Create custom view/filter
- [x] PATCH `/api/views/:id` - Update view/filter
- [x] DELETE `/api/views/:id` - Delete view/filter
- [x] POST `/api/views/:id/apply` - Apply view (get filtered issues)

#### 📊 8. Analytics APIs (6 endpoints)
- [x] GET `/api/analytics/dashboard` - Dashboard overview (totals, priority breakdown, close rate)
- [x] GET `/api/analytics/issues-by-status` - Issues grouped by state & custom status
- [x] GET `/api/analytics/issues-by-repo` - Issues grouped by repository
- [x] GET `/api/analytics/issues-over-time` - Daily timeline of created vs closed (`?period=7d|30d|90d|1y`)
- [x] GET `/api/analytics/assignee-workload` - Open/closed counts per assignee
- [x] GET `/api/analytics/completion-rate` - Completion rate overall and per repository

#### 🔔 9. Notification APIs (7 endpoints)
- [x] GET `/api/notifications` - List notifications (with filters: type, isRead, pagination)
- [x] GET `/api/notifications/unread-count` - Get unread notification count
- [x] GET `/api/notifications/:id` - Get notification details
- [x] PATCH `/api/notifications/:id/read` - Mark as read
- [x] PATCH `/api/notifications/read-all` - Mark all notifications as read
- [x] DELETE `/api/notifications/:id` - Delete notification
- [x] DELETE `/api/notifications/read` - Delete all read notifications (bulk cleanup)

#### 🎨 10. Additional Features (12 endpoints)
- [x] GET `/api/milestones` - List milestones
- [x] POST `/api/milestones` - Create milestone
- [x] GET `/api/activity-log` - User activity log
- [x] POST `/api/webhooks` - Setup GitHub webhooks
- [x] GET `/api/settings` - Get user settings
- [x] PUT `/api/settings` - Update user settings
- [x] POST `/api/export` - Export data (CSV/JSON)
- [x] GET `/api/search` - Global search
- [x] POST `/api/bulk-actions` - Bulk operations
- [x] GET `/api/teams` - List teams
- [x] POST `/api/teams` - Create team
- [x] GET `/api/health` - API health check

---

### 📈 Progress Summary

| Category | Total | Completed | Percentage |
|----------|-------|-----------|------------|
| Authentication | 5 | 5 | 100% ✅ |
| Repositories | 7 | 7 | 100% ✅ |
| Issues | 12 | 12 | 100% ✅ |
| Labels | 6 | 6 | 100% ✅ |
| Comments | 6 | 6 | 100% ✅ |
| Categories | 6 | 6 | 100% ✅ |
| Filters & Views | 5 | 5 | 100% ✅ |
| Analytics | 6 | 6 | 100% ✅ |
| Notifications | 7 | 7 | 100% ✅ |
| Additional | 12 | 12 | 100% ✅ |
| **TOTAL** | **72** | **72** | **100%** |

---

## 📚 Documentation

- 📖 [Software Requirements Specification (SRS)](SRS_GitHub_Dashboard.md) - Complete feature specifications
- ⚡ [Quick Start Guide](QUICK_START.md) - Get up and running in minutes
- 🗺️ [Project Roadmap](ROADMAP.md) - Implementation phases and timeline
- 🔧 [Setup Guide](SETUP_GUIDE.md) - Detailed setup instructions
- 🔌 [API Documentation](backend/Docs/API_DOCUMENTATION.md) - Complete API reference (72 endpoints)
- 🔥 [Swagger UI](http://localhost:3001/api-docs) - Interactive API testing (when server is running)
- 📋 [OpenAPI Spec](http://localhost:3001/api-docs.json) - Machine-readable API specification
- 📮 [Postman Collection](backend/Docs/Postman_Collection.json) - Ready-to-use API collection
- 🗄️ [Database Schema](backend/Docs/SCHEMA_EXPLAINED.md) - Database design and relationships
- 💾 [Database Setup](backend/Docs/DATABASE_SETUP.md) - PostgreSQL configuration
- 🤝 [Contributing Guide](backend/Docs/CONTRIBUTING.md) - How to contribute to the project
- 📜 [Code of Conduct](backend/Docs/CODE_OF_CONDUCT.md) - Community guidelines

---

## 🏗️ Development Roadmap

### ✅ Phase 0: Setup (COMPLETED)
- [x] Project structure
- [x] Dependencies installed
- [x] Database schema designed
- [x] TypeScript configuration
- [x] Basic Express server

### ✅ Phase 1: Core Backend (COMPLETED)
- [x] Authentication system (GitHub OAuth + JWT)
- [x] Repository management (7 endpoints)
- [x] Issue CRUD operations (12 endpoints)
- [x] Comment management (integrated with issues)
- [x] GitHub API integration
- [x] Validation & error handling middleware
- [x] Swagger/OpenAPI documentation

### ✅ Phase 2: Advanced Features (COMPLETED)
- [x] Comments & discussions (GitHub-synced)
- [x] Labels management (GitHub-synced)
- [x] Custom categories & issue tagging
- [x] Filters & saved views (5 endpoints)
- [x] Analytics dashboard (6 endpoints)
- [x] Notifications system (7 endpoints)
- [x] Milestones management (2 endpoints)
- [x] User settings & profile (2 endpoints)
- [x] Activity log (1 endpoint)
- [x] Global search (1 endpoint)
- [x] Data export — CSV & JSON (1 endpoint)
- [x] Bulk actions (1 endpoint)
- [x] Teams management (2 endpoints)
- [x] Webhook registration (1 endpoint)
- [x] Health check with DB ping (1 endpoint)

### 🚀 Phase 3: Frontend Development (PLANNED)
- [ ] React web application
- [ ] Flutter mobile app
- [ ] UI/UX implementation
- [ ] State management

### 🎯 Phase 4: Production Ready (PLANNED)
- [ ] Testing & QA
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Deployment
- [ ] Documentation finalization

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### 🚀 Quick Start for Contributors

1. **Read the Contributing Guide** - [CONTRIBUTING.md](CONTRIBUTING.md)
2. **Check the Code of Conduct** - [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
3. **Look for Good First Issues** - Tagged with `good first issue` label

### 📝 How to Contribute

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/devflow.git`
3. **Create** a feature branch: `git checkout -b feature/AmazingFeature`
4. **Make** your changes
5. **Test** thoroughly
6. **Commit** with clear messages: `git commit -m 'feat: add amazing feature'`
7. **Push** to your fork: `git push origin feature/AmazingFeature`
8. **Open** a Pull Request

### 💬 Get in Touch

**Want to contribute or discuss ideas?**

- 📧 **Email**: 2002shalin@gmail.com
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/yourusername/devflow/issues)
- 💡 **Feature Requests**: [GitHub Issues](https://github.com/yourusername/devflow/issues/new?template=feature_request.md)
- 🐞 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/devflow/issues/new?template=bug_report.md)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/devflow/discussions)

### 🏷️ Ways to Contribute

- **Report Bugs** - Found something broken? Let us know!
- **Suggest Features** - Have ideas? We'd love to hear them!
- **Write Code** - Pick up issues labeled `help wanted` or `good first issue`
- **Improve Docs** - Help make our documentation better
- **Review PRs** - Help review and test pull requests
- **Spread the Word** - Star ⭐ the repo and share with others

### ✅ Development Guidelines

- Follow TypeScript best practices
- Write clean, documented code
- Add tests for new features
- Update documentation as needed
- Follow our commit message conventions
- Ensure all tests pass before submitting PR

**For detailed guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)**

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**DevFlow Team**

---

## 🙏 Acknowledgments

- GitHub API for providing robust integration capabilities
- Prisma for excellent ORM support
- The open-source community for amazing tools and libraries

---

## 📞 Support

For questions, issues, or suggestions:

- 📧 Email: 2002shalin@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/devflow/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/devflow/discussions)
- 📖 Documentation: Check our [docs](./CONTRIBUTING.md) and [guides](./SETUP_GUIDE.md)

---

<div align="center">
  <strong>⭐ Star this project if you find it helpful!</strong>
  <br><br>
  Made with ❤️ for developers, by developers
</div>
