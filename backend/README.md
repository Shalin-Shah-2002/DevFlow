# DevFlow Backend

GitHub Project Dashboard Backend API built with Node.js, Express, TypeScript, and Prisma.

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

API documentation will be available at `/api/docs` (coming soon)

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
