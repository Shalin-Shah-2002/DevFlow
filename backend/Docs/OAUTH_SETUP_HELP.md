# Quick Testing Without GitHub OAuth

Since you're getting a 404 on the OAuth callback, here are your options:

## Option 1: Set Up GitHub OAuth (Recommended)

1. **Create OAuth App**: https://github.com/settings/developers
   - Callback URL: `http://localhost:3001/api/auth/github/callback`
   
2. **Update .env** with real credentials:
   ```
   GITHUB_CLIENT_ID="your_real_client_id"
   GITHUB_CLIENT_SECRET="your_real_client_secret"
   ```

3. **Restart server** and try again

## Option 2: Create a Test Token Endpoint (Quick Dev Testing)

Add this to `src/routes/auth.routes.ts` (FOR DEVELOPMENT ONLY):

```typescript
// TEMPORARY - For development testing only
if (process.env.NODE_ENV === 'development') {
  router.get('/dev-token', async (req: Request, res: Response) => {
    try {
      const prisma = require('../config/prisma').default;
      const jwt = require('jsonwebtoken');
      
      // Get or create a test user
      let user = await prisma.user.findFirst();
      
      if (!user) {
        // Create a dummy user for testing
        user = await prisma.user.create({
          data: {
            email: 'test@devflow.com',
            githubId: 99999999,
            githubLogin: 'testuser',
            accessToken: 'test_token',
            avatar: 'https://github.com/identicons/testuser.png',
          },
        });
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email, githubId: user.githubId },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );
      
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          githubLogin: user.githubLogin,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to generate token' });
    }
  });
}
```

Then get a token:
```bash
curl http://localhost:3001/api/auth/dev-token
```

Use the token for testing:
```bash
TOKEN="your_token_here"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/auth/me
```

## Option 3: Use Postman Mock Authentication

In Postman, you can mock the authentication and manually create a JWT token.

---

**Choose Option 1 for the real flow, or Option 2 for quick testing without GitHub setup.**
