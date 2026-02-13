# DevFlow Setup Guide

## 🗄️ Step 1: PostgreSQL Installation & Setup

### Option A: Install PostgreSQL Locally (Recommended for Development)

#### 1.1 Download PostgreSQL
1. Go to: https://www.postgresql.org/download/windows/
2. Download PostgreSQL 15 or 16 installer
3. Run the installer

#### 1.2 Installation Steps
- **Port:** 5432 (default)
- **Superuser Password:** Choose a strong password (remember this!)
- **Locale:** Default
- Install Stack Builder components (optional)

#### 1.3 Verify Installation
```powershell
# Check if PostgreSQL is running
Get-Service -Name postgresql*

# Should show "Running" status
```

#### 1.4 Access PostgreSQL
```powershell
# Open PostgreSQL command line (psql)
# Start Menu → PostgreSQL → SQL Shell (psql)
# Or using PowerShell:
psql -U postgres
```

#### 1.5 Create Database for DevFlow
```sql
-- In psql terminal:
CREATE DATABASE devflow_db;

-- Create a dedicated user (optional but recommended)
CREATE USER devflow_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE devflow_db TO devflow_user;

-- Exit psql
\q
```

### Option B: Use Cloud PostgreSQL (Alternative)

#### Railway (Free Tier Available)
1. Go to: https://railway.app/
2. Sign up/Login with GitHub
3. New Project → Provision PostgreSQL
4. Copy connection string

#### Supabase (Free Tier)
1. Go to: https://supabase.com/
2. Sign up and create new project
3. Go to Settings → Database → Connection String
4. Copy connection string

#### Neon (Free Tier)
1. Go to: https://neon.tech/
2. Sign up and create project
3. Copy connection string

---

## 🚀 Step 2: Project Initialization

### 2.1 Create Project Structure
```
devflow/
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/          # React Web App
│   ├── src/
│   ├── public/
│   └── package.json
│
├── mobile/            # Flutter App (later)
│   
└── README.md
```

### 2.2 Initialize Backend
```powershell
# Create directories
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install TypeScript
npm install -D typescript @types/node ts-node nodemon
npx tsc --init
```

### 2.3 Install Core Dependencies
```powershell
# Backend Framework
npm install express cors dotenv

# TypeScript types
npm install -D @types/express @types/cors

# Prisma ORM
npm install @prisma/client
npm install -D prisma

# Authentication
npm install passport passport-github2 jsonwebtoken bcrypt
npm install -D @types/passport @types/passport-github2 @types/jsonwebtoken @types/bcrypt

# Validation & Security
npm install express-validator helmet express-rate-limit

# Utilities
npm install axios
```

---

## 🛠️ Step 3: Configure Prisma

### 3.1 Initialize Prisma
```powershell
npx prisma init
```

This creates:
- `prisma/schema.prisma`
- `.env` file

### 3.2 Update .env File
```env
# Database
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/devflow_db?schema=public"

# Or for cloud PostgreSQL:
# DATABASE_URL="postgresql://user:password@host:port/database"

# GitHub OAuth (get these from GitHub)
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
GITHUB_CALLBACK_URL="http://localhost:5000/api/auth/github/callback"

# JWT
JWT_SECRET="your_super_secret_jwt_key_change_this"
JWT_EXPIRES_IN="7d"

# App
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### 3.3 Create Database Schema
The schema is already defined in the SRS. Copy it to `prisma/schema.prisma`

### 3.4 Run Prisma Migration
```powershell
# Generate Prisma Client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

---

## 🔑 Step 4: Setup GitHub OAuth App

### 4.1 Create GitHub OAuth Application
1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in details:
   - **Application name:** DevFlow (or your choice)
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:5000/api/auth/github/callback`
4. Click "Register application"
5. Copy **Client ID** and **Client Secret**
6. Paste them into your `.env` file

### 4.2 Set OAuth Scopes
You'll need these permissions:
- `repo` - Full control of repositories
- `read:org` - Read organization data
- `user:email` - Read user email

---

## 📝 Step 5: Create Basic Backend Structure

### 5.1 Update package.json Scripts
```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

### 5.2 Update tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

## 🎯 Step 6: Implementation Checklist

### Week 1: Foundation (Days 1-7)
- [x] PostgreSQL setup
- [ ] Prisma schema and migrations
- [ ] Basic Express server
- [ ] GitHub OAuth authentication
- [ ] JWT token generation
- [ ] Protected routes middleware
- [ ] User registration/login endpoints

### Week 2: Repository & Issues (Days 8-14)
- [ ] Add repository endpoint
- [ ] Fetch GitHub repositories API
- [ ] Sync repository issues
- [ ] List all issues endpoint
- [ ] Create issue endpoint
- [ ] Update issue endpoint
- [ ] Close issue endpoint
- [ ] Filtering & search logic

### Week 3: Frontend MVP (Days 15-21)
- [ ] Setup React project (Vite)
- [ ] Setup React Router
- [ ] Setup state management (Redux/Zustand)
- [ ] Login page with GitHub OAuth
- [ ] Dashboard layout
- [ ] Repository list page
- [ ] Issue list view
- [ ] Create/Edit issue modal
- [ ] Basic filtering UI

### Week 4: Polish & Deploy (Days 22-28)
- [ ] Add loading states
- [ ] Error handling
- [ ] Dark mode toggle
- [ ] Responsive design
- [ ] API error handling
- [ ] Deploy backend (Railway/Render)
- [ ] Deploy frontend (Vercel)
- [ ] Environment variables setup
- [ ] Testing

---

## 📚 Step 7: Development Workflow

### 7.1 Daily Development Flow
```powershell
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend (later)
cd frontend
npm run dev

# Terminal 3: Prisma Studio (optional)
cd backend
npm run prisma:studio
```

### 7.2 Database Changes
```powershell
# After modifying schema.prisma
npx prisma migrate dev --name describe_your_change
npx prisma generate
```

### 7.3 Git Workflow
```powershell
# Initialize Git
git init
git add .
git commit -m "Initial setup"

# Create .gitignore
echo "node_modules/
.env
dist/
.DS_Store" > .gitignore

# Push to GitHub
git remote add origin <your-repo-url>
git push -u origin main
```

---

## 🐛 Troubleshooting

### PostgreSQL Connection Issues
```powershell
# Check if PostgreSQL is running
Get-Service postgresql*

# Start service if stopped
Start-Service postgresql-x64-15  # Adjust version number

# Test connection
psql -U postgres -d devflow_db
```

### Prisma Migration Errors
```powershell
# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset

# Force deploy migrations
npx prisma migrate deploy
```

### Port Already in Use
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

---

## 📖 Quick Reference

### Useful Commands
```powershell
# Prisma
npx prisma studio                    # Open database GUI
npx prisma format                    # Format schema.prisma
npx prisma validate                  # Validate schema
npx prisma db push                   # Push schema without migration

# Node.js
npm install                          # Install dependencies
npm run dev                          # Start dev server
npm run build                        # Build for production

# Database
psql -U postgres                     # Open PostgreSQL CLI
\l                                   # List databases
\c devflow_db                        # Connect to database
\dt                                  # List tables
\q                                   # Quit
```

### Environment Variables Template
Create `.env.example`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/devflow_db"
GITHUB_CLIENT_ID="your_client_id"
GITHUB_CLIENT_SECRET="your_client_secret"
GITHUB_CALLBACK_URL="http://localhost:5000/api/auth/github/callback"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

---

## 🚀 Next Steps After Setup

1. **Test Database Connection** - Ensure Prisma can connect
2. **Create Express Server** - Basic server with routes
3. **Implement Auth** - GitHub OAuth flow
4. **Build API Endpoints** - Following SRS specification
5. **Create Frontend** - React application
6. **Integrate API** - Connect frontend to backend
7. **Test Features** - Manual and automated testing
8. **Deploy** - Production deployment

---

## 📞 Support Resources

- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Prisma Docs:** https://www.prisma.io/docs/
- **Express Docs:** https://expressjs.com/
- **GitHub API:** https://docs.github.com/en/rest
- **TypeScript Docs:** https://www.typescriptlang.org/docs/

---

**Ready to start coding?** Follow this guide step by step! 🎉
