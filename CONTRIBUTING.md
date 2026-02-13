# Contributing to DevFlow

Thank you for your interest in contributing to DevFlow! We welcome contributions from the community.

## 📋 Table of Contents
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Reporting Issues](#reporting-issues)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Code Guidelines](#code-guidelines)
- [Communication Channels](#communication-channels)

---

## 🤝 How Can I Contribute?

There are many ways you can contribute to DevFlow:

1. **Report Bugs** - Found a bug? Let us know!
2. **Suggest Features** - Have ideas? We'd love to hear them
3. **Write Code** - Pick up issues and submit PRs
4. **Improve Documentation** - Help make our docs better
5. **Review Pull Requests** - Help review and test PRs
6. **Spread the Word** - Star the repo, share with others

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Git
- GitHub account

### Setup Development Environment

1. **Fork the Repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/devflow.git
   cd devflow
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/devflow.git
   ```

4. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

5. **Setup Database**
   ```bash
   # Create PostgreSQL database
   createdb -U postgres devflow_db
   
   # Copy environment file
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Run migrations
   npm run prisma:migrate
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Verify Setup**
   ```bash
   # In another terminal
   curl http://localhost:5000/api/health
   ```

---

## 💻 Development Workflow

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes
- Write clean, readable code
- Follow existing code style
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes
```bash
# Run tests
npm test

# Lint code
npm run lint

# Build to check for TypeScript errors
npm run build
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add user authentication"
```

**Commit message format:**
```
<type>: <short description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

**Examples:**
```
feat: add GitHub OAuth authentication
fix: resolve issue with repository sync
docs: update API documentation
refactor: improve error handling in auth controller
```

### 5. Keep Your Branch Updated
```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push to Your Fork
```bash
git push origin feature/your-feature-name
```

---

## 🐛 Reporting Issues

Before creating an issue, please:
1. **Search existing issues** to avoid duplicates
2. **Check if it's already fixed** in the latest version
3. **Gather information** about the bug

### Bug Report Template
When reporting bugs, include:
- **Description** - Clear description of the issue
- **Steps to Reproduce** - How to trigger the bug
- **Expected Behavior** - What should happen
- **Actual Behavior** - What actually happens
- **Environment** - OS, Node version, database version
- **Screenshots** - If applicable
- **Error Logs** - Console output or error messages

### Feature Request Template
When suggesting features:
- **Problem Description** - What problem does it solve?
- **Proposed Solution** - Your suggested implementation
- **Alternatives** - Other solutions you considered
- **Use Cases** - Real-world scenarios

---

## 🔀 Submitting Pull Requests

### Pull Request Process

1. **Ensure your code follows the guidelines**
   - Passes all tests
   - No TypeScript errors
   - Follows code style
   - Includes documentation

2. **Update the documentation**
   - Add/update API docs if needed
   - Update README if applicable
   - Add comments for complex logic

3. **Write a good PR description**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Related Issue
   Fixes #123
   
   ## Changes Made
   - Added authentication middleware
   - Updated user model
   - Added tests
   
   ## Testing Done
   - Tested login flow
   - Verified JWT generation
   - Checked error handling
   
   ## Screenshots (if applicable)
   [Add screenshots]
   ```

4. **Link related issues**
   - Use keywords: `Fixes #123`, `Closes #456`, `Resolves #789`

5. **Request review**
   - Tag maintainers if needed
   - Be responsive to feedback

6. **Make requested changes**
   - Address review comments
   - Push updates to the same branch

### PR Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No merge conflicts
- [ ] PR description is clear

---

## 📝 Code Guidelines

### TypeScript Style
```typescript
// Use TypeScript types
interface User {
  id: string;
  email: string;
  githubId: number;
}

// Use async/await over promises
async function getUser(id: string): Promise<User> {
  return await prisma.user.findUnique({ where: { id } });
}

// Handle errors properly
try {
  const user = await getUser(userId);
} catch (error) {
  logger.error('Failed to get user', error);
  throw new ApiError(500, 'Database error');
}
```

### File Organization
```
src/
├── controllers/    # Request handlers
├── routes/         # Route definitions
├── services/       # Business logic
├── middleware/     # Express middleware
├── utils/          # Helper functions
├── types/          # TypeScript types
└── index.ts        # Entry point
```

### Naming Conventions
- **Files**: `kebab-case.ts` (e.g., `user-service.ts`)
- **Classes**: `PascalCase` (e.g., `AuthController`)
- **Functions**: `camelCase` (e.g., `getUserById`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`)
- **Interfaces**: `PascalCase` with I prefix optional (e.g., `User` or `IUser`)

### API Design
```typescript
// RESTful endpoints
GET    /api/issues          // List issues
GET    /api/issues/:id      // Get single issue
POST   /api/issues          // Create issue
PATCH  /api/issues/:id      // Update issue
DELETE /api/issues/:id      // Delete issue

// Response format
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-02-13T..."
}

// Error format
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": []
  }
}
```

### Testing
```typescript
// Write unit tests
describe('AuthService', () => {
  it('should generate valid JWT token', async () => {
    const token = await authService.generateToken(user);
    expect(token).toBeDefined();
  });
});

// Write integration tests
describe('POST /api/auth/login', () => {
  it('should return 200 and JWT token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    
    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeDefined();
  });
});
```

---

## 💬 Communication Channels

### Get Help & Discuss

1. **GitHub Issues** - Bug reports and feature requests
   - https://github.com/YOUR_USERNAME/devflow/issues

2. **GitHub Discussions** - General questions and ideas
   - https://github.com/YOUR_USERNAME/devflow/discussions

3. **Email** - For sensitive matters
   - 2002shalin@gmail.com

4. **Discord** (Optional - if you create one)
   - [Discord invite link]

### Response Times
- Issues: We aim to respond within 48 hours
- Pull Requests: Review within 2-3 days
- Security issues: Within 24 hours

---

## 🏷️ Good First Issues

New to the project? Look for issues labeled:
- `good first issue` - Easy tasks for beginners
- `help wanted` - Issues where we need help
- `documentation` - Doc improvements

### Example First Contributions
- Fix typos in documentation
- Add comments to existing code
- Improve error messages
- Add unit tests
- Update dependencies

---

## 🔒 Security Issues

**DO NOT** open public issues for security vulnerabilities!

Instead:
1. Email **2002shalin@gmail.com** with details
2. Include "SECURITY" in subject line
3. Provide description and steps to reproduce
4. Allow time for fix before public disclosure

We'll acknowledge within 24 hours and work on a fix.

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

## 🎉 Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation (for major contributions)

---

## ❓ Questions?

Don't hesitate to ask! You can:
- Open a discussion on GitHub
- Comment on related issues
- Email maintainers

**Thank you for contributing to DevFlow! 🚀**
