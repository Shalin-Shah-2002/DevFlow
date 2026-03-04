# Backend Deployment Journey

Complete record of how the DevFlow backend was deployed to AWS EC2 with Docker and GitHub Actions CI/CD — including every error hit along the way and how each was fixed.

---

## Final Result

| Item | Value |
|---|---|
| **Live URL** | `http://16.16.218.19:3001` |
| **Swagger UI** | `http://16.16.218.19:3001/api-docs` |
| **Server** | AWS EC2 t3.micro — `eu-north-1` (Stockholm) |
| **Database** | AWS RDS PostgreSQL 17 — `devflow-postgres.c38ii6kqo162.eu-north-1.rds.amazonaws.com` |
| **Docker Image** | `ghcr.io/shalin-shah-2002/devflow-backend:latest` |
| **Deploy trigger** | Every push to `main` that touches `backend/` |

---

## What Was Built

### Files Created

| File | Purpose |
|---|---|
| `backend/Dockerfile` | Multi-stage Docker build (builder + runner) |
| `backend/.dockerignore` | Excludes node_modules, dist, .env from image |
| `backend/docker-compose.ec2.yml` | Compose file used on EC2 |
| `backend/scripts/test-all-apis.js` | Smoke tests all Swagger endpoints in CI |
| `.github/workflows/backend-cicd.yml` | Full 3-job CI/CD pipeline |
| `backend/Docs/AWS_EC2_RDS_DEPLOYMENT_GUIDE.md` | Step-by-step AWS setup guide |

### AWS Infrastructure Created

| Resource | Details |
|---|---|
| EC2 Instance | `i-021eb2b6244e0f2a7`, t3.micro, Amazon Linux 2, `eu-north-1c` |
| EC2 Security Group | `ssg-backend-ec2` — ports 22 (SSH) and 3001 (API) open |
| RDS Instance | PostgreSQL 17.6, `devflow-postgres`, `eu-north-1` |
| RDS Security Group | `ssg-rds-postgres` — port 5432 open to EC2's security group |

### GitHub Secrets Added

| Secret | Purpose |
|---|---|
| `EC2_HOST` | `16.16.218.19` |
| `EC2_USER` | `ec2-user` |
| `EC2_SSH_KEY` | EC2 private key (PEM) for SSH/SCP access |
| `BACKEND_ENV_FILE` | Full `.env` content for production |

---

## CI/CD Pipeline Explained

Three jobs run in sequence — if any job fails, the next one does not start.

```
push to main
     │
     ▼
Job 1: api-tests
├── Starts a real PostgreSQL 16 container
├── Runs prisma migrate deploy
├── Builds TypeScript → dist/
├── Seeds test data
├── Generates a JWT token for testing
├── Starts the backend server (background)
├── Waits up to 80s for /api-docs.json to respond
└── Runs scripts/test-all-apis.js — hits every Swagger endpoint
     └── Any 500 = FAIL, everything else = PASS

Job 2: build-and-push-image
├── Builds backend/Dockerfile (multi-stage)
│   Stage 1 (builder):
│   ├── node:20-slim + openssl
│   ├── npm ci
│   ├── prisma generate
│   ├── npm run build → dist/
│   └── node -e "writeFileSync('swagger.json', spec)"
│   Stage 2 (runner):
│   ├── node:20-slim + openssl
│   ├── npm ci --omit=dev (no devDeps)
│   ├── COPY dist/, .prisma/, swagger.json, prisma/
│   └── ~200MB lean final image
└── Pushes to GHCR:
     ├── ghcr.io/shalin-shah-2002/devflow-backend:latest
     └── ghcr.io/shalin-shah-2002/devflow-backend:sha-xxxxxxx

Job 3: deploy-ec2
├── SCP docker-compose.yml → EC2 /opt/devflow-backend/
├── SSH into EC2:
│   ├── Write .env from BACKEND_ENV_FILE secret
│   ├── docker login ghcr.io
│   ├── docker compose pull
│   ├── docker compose up -d --remove-orphans
│   └── docker image prune (clean images older than 72h)
└── Container starts:
     └── CMD: prisma migrate deploy && node dist/index.js
```

---

## Errors Hit & Fixes Applied

### Error 1 — EC2 was Amazon Linux, not Ubuntu

**When:** Setting up Docker on EC2 via SSH.

**Error:**
```
bash: apt: command not found
```

**Cause:** The EC2 instance was Amazon Linux 2, which uses `yum`/`dnf`, not `apt`.

**Fix:**
```bash
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Docker Compose is not included — install manually
mkdir -p ~/.docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose
```

---

### Error 2 — API Tests: 5 routes returning 500

**When:** First CI run — `api-tests` job.

**Error output:**
```
FAIL  GET /api/issues/test-id → 500
FAIL  PATCH /api/issues/test-id → 500
FAIL  DELETE /api/issues/test-id → 500
FAIL  GET /api/issues/test-id/comments → 500
FAIL  DELETE /api/issues/test-id/comments/test-id → 500
```

**Cause 1:** The fake ID `test-id` was not a valid CUID format. Prisma threw a validation error (P2023) which the error middleware returned as 500.

**Fix 1:** Changed fake ID to a valid CUID:
```js
// Before
const FAKE_ID = 'test-id';

// After
const FAKE_ID = 'clzzzzzzzzzzzzzzzzzzzzzzz';
```

**Cause 2:** Even with a valid CUID, the record doesn't exist. Prisma threw P2025 "Record not found" but error middleware returned it as 500.

**Fix 2:** Updated `error.middleware.ts` to map "not found" errors to 404:
```typescript
const isNotFound =
  err.statusCode === 404 ||
  /not found/i.test(err.message || '') ||
  err.code === 'P2025';
const statusCode = isNotFound ? 404 : (err.statusCode || 500);
```

---

### Error 3 — Docker image name uppercase rejected

**When:** `build-and-push-image` job tried to push to GHCR.

**Error:**
```
invalid reference format: repository name
(Shalin-Shah-2002/devflow-backend) must be lowercase
```

**Cause:** GitHub Actions `github.repository_owner` preserves the original casing (`Shalin-Shah-2002`). GHCR requires all-lowercase image names.

**Fix:** Hardcoded the lowercase owner directly in the workflow:
```yaml
# Before (broken)
images: ghcr.io/${{ github.repository_owner }}/devflow-backend

# After (fixed)
images: ghcr.io/shalin-shah-2002/devflow-backend
```

---

### Error 4 — `${IMAGE}` variable not set on EC2

**When:** Running `docker compose ps` manually on EC2.

**Error:**
```
WARN: The "IMAGE" variable is not set. Defaulting to a blank string.
service "backend" has neither an image nor a build context specified
```

**Cause:** The deploy script used `export IMAGE=...` which is an ephemeral shell variable — gone as soon as the SSH session ends. When running `docker compose` manually (or on container restart), the variable was missing.

**Fix:** Hardcoded the image name directly in `docker-compose.ec2.yml`:
```yaml
# Before
services:
  backend:
    image: ${IMAGE}

# After
services:
  backend:
    image: ghcr.io/shalin-shah-2002/devflow-backend:latest
```

---

### Error 5 — Prisma crashes: OpenSSL not found (Alpine)

**When:** Container started on EC2 — immediately crash-looped.

**Error logs:**
```
prisma:warn Prisma failed to detect the libssl/openssl version to use,
and may not work as expected. Defaulting to "openssl-1.1.x".
Please manually install OpenSSL and try installing Prisma again.

Error: Could not parse schema engine response:
SyntaxError: Unexpected token 'E', "Error load"... is not valid JSON
```

**Cause:** The Dockerfile used `node:20-alpine`. Alpine Linux uses musl libc and does not include OpenSSL by default. Prisma's query engine and schema engine binaries require OpenSSL to run.

**Fix:** Switched from Alpine to Debian slim and installed OpenSSL explicitly:
```dockerfile
# Before
FROM node:20-alpine AS builder
FROM node:20-alpine AS runner

# After
FROM node:20-slim AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

FROM node:20-slim AS runner
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
```

---

### Error 6 — RDS unreachable from container (P1001)

**When:** Container started but crashed on `prisma migrate deploy`.

**Error logs:**
```
Error: P1001: Can't reach database server at
`devflow-postgres.c38ii6kqo162.eu-north-1.rds.amazonaws.com:5432`

Please make sure your database server is running at
`devflow-postgres.c38ii6kqo162.eu-north-1.rds.amazonaws.com:5432`.
```

**Cause:** The RDS security group (`ssg-rds-postgres`) had no inbound rule allowing port 5432 from the EC2 instance.

**Fix:** Added inbound rule to `ssg-rds-postgres` in AWS Console:
- **Type:** PostgreSQL
- **Port:** 5432
- **Source:** `ssg-backend-ec2` (the EC2 security group — not an IP, so it works even if EC2 IP changes)

---

### Error 7 — Swagger UI blank white screen

**When:** Opening `http://16.16.218.19:3001/api-docs/` in browser.

**Symptom:** Tab title showed "DevFlow API Docs" (HTML loaded fine) but page was completely blank. No endpoints visible.

**Cause 1 — Missing source files in container:**
`swagger-jsdoc` was configured to read JSDoc comments from `./src/routes/*.ts`. In the production Docker image, only `dist/` exists — `src/` is not copied. So the spec was generated empty.

**Fix 1:** Pre-generate `swagger.json` at build time and serve it from file:
```dockerfile
# In Dockerfile builder stage — after npm run build:
RUN node -e "const s=require('./dist/config/swagger'); \
  const fs=require('fs'); \
  fs.writeFileSync('./swagger.json', JSON.stringify(s.swaggerSpec));"

# Copy into runner stage:
COPY --from=builder /app/swagger.json ./swagger.json
```

And in `swagger.ts`:
```typescript
function loadSwaggerSpec() {
  const prebuilt = path.join(process.cwd(), 'swagger.json');
  if (fs.existsSync(prebuilt)) {
    return JSON.parse(fs.readFileSync(prebuilt, 'utf-8'));
  }
  return swaggerJsdoc(options); // fallback for local dev
}
export const swaggerSpec = loadSwaggerSpec();
```

**Cause 2 — Helmet CSP `upgrade-insecure-requests`:**
Even after fixing the spec, Swagger UI was still blank. Helmet adds `upgrade-insecure-requests` to the `Content-Security-Policy` header by default. This tells the browser to convert all HTTP sub-resource requests (JS/CSS) to HTTPS. Since the server only runs plain HTTP, the swagger-ui bundle and CSS failed to load.

Response headers showed:
```
Content-Security-Policy: ... upgrade-insecure-requests
```

**Fix 2:** Mount Swagger routes **before** Helmet (so CSP headers don't apply to `/api-docs`), and also disable `upgrade-insecure-requests`:
```typescript
// BEFORE helmet:
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

// Helmet with upgrade-insecure-requests disabled:
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      upgradeInsecureRequests: null,  // ← fix
    },
  },
}));
```

---

### Error 8 — Port 3001 timing out from browser

**When:** Trying to access `http://16.16.218.19:3001` from browser / curl.

**Error:**
```
curl: (28) Connection timed out after 8003 milliseconds
```

**Cause:** The EC2 security group `ssg-backend-ec2` only had SSH (port 22) open. Port 3001 was not in the inbound rules.

**Fix:** Added inbound rule to `ssg-backend-ec2` in AWS Console:
- **Type:** Custom TCP
- **Port:** 3001
- **Source:** `0.0.0.0/0`

---

## Timeline

```
Day 1
├── Created Dockerfile, .dockerignore, docker-compose.ec2.yml
├── Created scripts/test-all-apis.js
├── Created .github/workflows/backend-cicd.yml
├── Set up EC2 security groups + attached to instance
├── Created RDS PostgreSQL instance
├── Installed Docker on EC2 (yum, not apt — Amazon Linux)
├── Created /opt/devflow-backend on EC2
├── Added GitHub secrets
├── First CI push → api-tests: 61/66 FAIL (Error 2)
├── Fixed fake ID + error middleware → 66/66 PASS
├── Docker build/push → FAIL (Error 3 — uppercase image name)
├── Fixed image name → build succeeded
├── Deploy → container Restarting (Error 4 — ${IMAGE} var)
├── Fixed compose file → container started but crashed (Error 5 — Alpine/OpenSSL)
├── Fixed Dockerfile → node:20-slim + openssl → crashed again (Error 6 — RDS unreachable)
├── Fixed RDS security group → container UP ✅
├── Opened port 3001 in EC2 SG (Error 8)
└── Swagger blank screen (Error 7) → pre-built spec + Helmet CSP fix → Swagger UI live ✅
```

---

## Current State

```
✅ Container running:  docker compose ps → Up
✅ API responding:     http://16.16.218.19:3001
✅ Swagger UI live:    http://16.16.218.19:3001/api-docs  (47 paths)
✅ Database connected: RDS PostgreSQL 17
✅ CI/CD working:      auto-deploys on every push to main
⏳ Frontend:           Cloudflare Pages deployment — pending
```
