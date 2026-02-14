# 🗄️ PostgreSQL Database Setup for DevFlow

## Step 1: Open PostgreSQL Command Line

### Option A: Using pgAdmin (GUI)
1. Open **pgAdmin** from Start Menu
2. Connect to your PostgreSQL server (default: localhost)
3. Right-click on "Databases" → "Create" → "Database"
4. Name: `devflow_db`
5. Click Save

### Option B: Using Command Line (Recommended)

#### Find PostgreSQL Installation Path
Your PostgreSQL is installed. Common paths:
- `C:\Program Files\PostgreSQL\18\bin\`
- `C:\Program Files\PostgreSQL\16\bin\`

#### Add to PATH (One-time setup)
```powershell
# Add PostgreSQL to PATH (run as Administrator)
$pgPath = "C:\Program Files\PostgreSQL\18\bin"
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$pgPath", "Machine")

# Close and reopen PowerShell after this
```

#### Create Database
```powershell
# Method 1: Using createdb utility
createdb -U postgres devflow_db

# Method 2: Using psql
psql -U postgres -c "CREATE DATABASE devflow_db;"
```

When prompted, enter your PostgreSQL password (set during installation).

## Step 2: Verify Database Creation

```powershell
# List all databases
psql -U postgres -c "\l"

# Or connect to the database
psql -U postgres -d devflow_db
```

You should see `devflow_db` in the list.

## Step 3: Create .env File

In the `backend` folder, create a `.env` file (copy from .env.example):

```powershell
cd D:\S_Projects\New_Project\backend
Copy-Item .env.example .env
```

## Step 4: Update .env File

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/devflow_db?schema=public"
```

Replace `YOUR_POSTGRES_PASSWORD` with your actual PostgreSQL password.

Example:
```env
DATABASE_URL="postgresql://postgres:mypassword123@localhost:5432/devflow_db?schema=public"
```

## Step 5: Run Prisma Migrations

```powershell
# Generate Prisma Client
npm run prisma:generate

# Create and apply database migrations
npm run prisma:migrate

# When prompted, enter migration name: "init"
```

This will:
- Create all database tables
- Set up relationships
- Create indexes

## Step 6: Verify Database Setup

```powershell
# Open Prisma Studio (web-based database viewer)
npm run prisma:studio
```

This opens http://localhost:5555 where you can see all your tables.

## Troubleshooting

### Issue: "psql: command not found"

**Solution:** PostgreSQL bin folder not in PATH.

Temporary fix (for current session only):
```powershell
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"
```

Permanent fix: Add to system PATH (see "Add to PATH" above).

### Issue: "password authentication failed"

**Solution 1:** Check your PostgreSQL password
```powershell
# Reset password (if needed)
psql -U postgres
# In psql:
ALTER USER postgres PASSWORD 'new_password';
\q
```

**Solution 2:** Verify pg_hba.conf authentication method
Located at: `C:\Program Files\PostgreSQL\18\data\pg_hba.conf`

Change `md5` to `trust` temporarily (not recommended for production).

### Issue: "database already exists"

**Solution:** Database was already created. Just proceed to Step 3.

### Issue: "port 5432 already in use"

**Solution:** PostgreSQL is already running, which is normal. Continue to next step.

## Alternative: Use Cloud Database

If local setup is problematic, use a free cloud PostgreSQL:

### Neon (Recommended - Free tier)
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create new project: "devflow"
4. Copy connection string
5. Paste into .env as DATABASE_URL

### Supabase (Alternative)
1. Go to https://supabase.com
2. Create project: "devflow"
3. Go to Settings → Database → Connection String
4. Copy and paste into .env

### Railway (Alternative)
1. Go to https://railway.app
2. New Project → PostgreSQL
3. Copy DATABASE_URL from Variables tab
4. Paste into .env

## Next Steps

After database is set up:

1. ✅ Test the connection:
   ```powershell
   npm run prisma:studio
   ```

2. ✅ Start the development server:
   ```powershell
   npm run dev
   ```

3. ✅ Visit http://localhost:5000 to verify API is running

## Database Schema Overview

Your database has these tables:
- `users` - User accounts (GitHub OAuth)
- `repositories` - GitHub repositories
- `issues` - GitHub issues
- `labels` - Issue labels
- `comments` - Issue comments
- `categories` - Custom categories
- `notes` - Private notes
- `reminders` - Issue reminders
- `notifications` - User notifications
- `teams` - Team management
- `time_entries` - Time tracking

All relationships and indexes are automatically created by Prisma!

---

**Need Help?** Check the main SETUP_GUIDE.md or ask for assistance!
