# ⚡ QUICK START - Do This Now!

## 🎯 You're 3 Steps Away from Running DevFlow!

---

## ✅ What's Already Done:

- ✅ Project structure created
- ✅ All dependencies installed (269 packages!)
- ✅ Prisma ORM configured
- ✅ Express server created
- ✅ PostgreSQL is running on your system
- ✅ .env file created

---

## 🚀 3 Steps to Complete Setup:

### **STEP 1: Create Database** (2 minutes)

#### Option A: Command Line (Easiest)
```powershell
# Add PostgreSQL to your PATH (current session only)
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"

# Create the database (you'll be asked for PostgreSQL password)
createdb -U postgres devflow_db
```

**Enter your PostgreSQL password** when prompted.
(This is the password you set when installing PostgreSQL)

#### Option B: Using pgAdmin (GUI Alternative)
1. Open **pgAdmin** from Start Menu
2. Connect to PostgreSQL Server (localhost)
3. Right-click "Databases" → Create → Database
4. Name: `devflow_db`
5. Click Save

#### Option C: Use Free Cloud Database (Skip local setup)
Go to https://neon.tech → Sign up → Create project "devflow"
Copy the connection string for next step.

---

### **STEP 2: Configure Database Connection** (30 seconds)

Edit the `.env` file in the `backend` folder:

```powershell
# Open .env file in notepad
notepad .env
```

**Update this line:**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/devflow_db?schema=public"
```

**Replace `YOUR_PASSWORD_HERE`** with your actual PostgreSQL password.

If using cloud database (Neon), replace entire DATABASE_URL with their connection string.

**Example:**
```env
DATABASE_URL="postgresql://postgres:mypass123@localhost:5432/devflow_db?schema=public"
```

**Save and close** the file.

---

### **STEP 3: Run Database Migrations** (1 minute)

This creates all your database tables automatically:

```powershell
# Make sure you're in backend folder
cd D:\S_Projects\New_Project\backend

# Generate Prisma Client
npm run prisma:generate

# Create database tables
npm run prisma:migrate
```

When asked "Enter a name for the new migration", type: **init**

You should see:
```
✔ Generated Prisma Client
✔ Database migrations applied
```

---

## 🎉 DONE! Now Start the Server:

```powershell
npm run dev
```

You should see:
```
╔═══════════════════════════════════════╗
║     🚀 DevFlow API Server Started    ║
╚═══════════════════════════════════════╝
  
  🌐 Server: http://localhost:5000
```

**Open browser:** http://localhost:5000

You should see: `"🚀 DevFlow API Server"`

---

## 🔍 Verify Everything Works:

```powershell
# In a NEW terminal window:

# 1. Check database (opens web GUI at localhost:5555)
npm run prisma:studio

# 2. Test API health endpoint
curl http://localhost:5000/api/health
```

---

## 📋 What's Next?

After the server is running, you have TWO options:

### Option A: Create Frontend (React App)
```powershell
cd D:\S_Projects\New_Project
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm run dev
```

### Option B: Continue with Backend (Add features)
Follow the **ROADMAP.md** → Priority 2: Implement Authentication

See [ROADMAP.md](ROADMAP.md) for complete development plan!

---

## ❌ Troubleshooting

### "createdb: command not found"
**Fix:**
```powershell
# Add to PATH
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"
```

### "password authentication failed"
- Check your PostgreSQL password
- Try using pgAdmin instead (Option B)
- Or use Neon cloud database (Option C)

### "database already exists"
That's fine! Skip to Step 2.

### "Prisma migrate failed"
```powershell
# Force push schema
npm run prisma:push
```

### "Port 5000 already in use"
```powershell
# Find and kill the process
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

---

## 📁 Your Project Structure:

```
D:\S_Projects\New_Project\
├── backend/              ← YOU ARE HERE
│   ├── src/
│   │   └── index.ts      ← Main server file
│   ├── prisma/
│   │   └── schema.prisma ← Database schema (18 tables!)
│   ├── .env              ← Configure this!
│   ├── package.json
│   └── README.md
├── SRS_GitHub_Dashboard.md  ← Full specification
├── SETUP_GUIDE.md           ← Detailed setup guide
├── DATABASE_SETUP.md        ← Database help
├── ROADMAP.md               ← Development plan
└── QUICK_START.md           ← This file!
```

---

## 🎯 Quick Commands Cheat Sheet:

```powershell
# Backend Development
npm run dev              # Start server with hot reload
npm run prisma:studio    # View database in browser
npm run prisma:migrate   # Apply schema changes
npm run build            # Build for production
npm start                # Run production build

# Database
createdb -U postgres devflow_db     # Create database
psql -U postgres -d devflow_db      # Connect to database
psql -U postgres -c "\l"            # List all databases
```

---

## 🚨 IMPORTANT: Next Immediate Task

After completing these 3 steps, you need to:

**Setup GitHub OAuth Application:**
1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Name: DevFlow
   - Homepage: http://localhost:3000
   - Callback: http://localhost:5000/api/auth/github/callback
4. Copy Client ID and Secret
5. Add to `.env` file

Then you can start implementing features!

---

## 📞 Need Help?

- Check [DATABASE_SETUP.md](backend/DATABASE_SETUP.md) for detailed database instructions
- Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for complete setup guide
- Check [ROADMAP.md](ROADMAP.md) for what to build next

---

**You got this! 🚀 Let's build something awesome!**

---

Last Updated: February 13, 2026
