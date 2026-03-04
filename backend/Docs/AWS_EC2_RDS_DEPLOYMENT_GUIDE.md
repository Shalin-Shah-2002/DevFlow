# DevFlow Backend: Full AWS Configuration & Deployment Guide (EC2 + RDS PostgreSQL)

This guide is for your current situation:
- You already have an EC2 instance
- You do **not** have PostgreSQL yet
- You want backend + database hosted fully on AWS

Recommended architecture:
- **Backend** on EC2 (Docker container)
- **Database** on Amazon RDS PostgreSQL
- **CI/CD** with GitHub Actions (already added in this project)

---

## 1) AWS Resources You Need

1. EC2 instance (already available)
2. RDS PostgreSQL instance (create now)
3. Security groups:
   - `sg-backend-ec2` for EC2
   - `sg-rds-postgres` for RDS

Keep EC2 and RDS in the same region for low latency.

---

## 2) Security Group Setup (Important)

### EC2 security group (`sg-backend-ec2`)
Inbound:
- `22` from your IP (SSH)
- `3001` from allowed clients (or temporarily `0.0.0.0/0` for testing)

Outbound:
- Allow all (default is fine)

### RDS security group (`sg-rds-postgres`)
Inbound:
- `5432` source = **security group** `sg-backend-ec2` (not public IP)

Outbound:
- Default allow all

This ensures only your EC2 backend can connect to the database.

---

## 3) Create RDS PostgreSQL

In AWS Console:
1. Go to **RDS → Create database**
2. Choose **PostgreSQL**
3. Template: **Free tier** or **Dev/Test** (for starting)
4. DB instance identifier: `devflow-postgres`
5. Master username: `devflow_user`
6. Set strong password and store it securely
7. Connectivity:
   - VPC: same as EC2
   - Public access: **No** (recommended)
   - Security group: `sg-rds-postgres`
8. Initial database name: `devflow`
9. Create DB

After creation, copy:
- RDS endpoint (example: `devflow-postgres.abc123.ap-south-1.rds.amazonaws.com`)
- Port (`5432`)

---

## 4) Prepare EC2 for Docker Deployment

SSH into EC2:

```bash
ssh -i <key.pem> ubuntu@<EC2_PUBLIC_IP>
```

Install Docker:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

Create deploy folder:

```bash
sudo mkdir -p /opt/devflow-backend
sudo chown -R $USER:$USER /opt/devflow-backend
```

---

## 5) Configure GitHub Repository Secrets

Go to GitHub repo:
**Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

1. `EC2_HOST`
   - Value: EC2 public IP or DNS

2. `EC2_USER`
   - Value: `ubuntu` (or your SSH user)

3. `EC2_SSH_KEY`
   - Value: full private key content

4. `BACKEND_ENV_FILE`
   - Value: complete production env file content (multiline), example:

```dotenv
DATABASE_URL=postgresql://devflow_user:<RDS_PASSWORD>@<RDS_ENDPOINT>:5432/devflow?schema=public
GITHUB_CLIENT_ID=<github_client_id>
GITHUB_CLIENT_SECRET=<github_client_secret>
GITHUB_CALLBACK_URL=https://<your-domain>/api/auth/github/callback
JWT_SECRET=<very_strong_secret>
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://<your-frontend-domain>
```

Replace placeholders with real values.

---

## 6) Ensure GitHub OAuth App Matches Production URL

In GitHub OAuth app settings:
- Homepage URL: your frontend URL
- Authorization callback URL:
  - `https://<your-domain>/api/auth/github/callback`

Must match `GITHUB_CALLBACK_URL` in `BACKEND_ENV_FILE` exactly.

---

## 7) Deploy Using CI/CD

Your workflow file:
- `.github/workflows/backend-cicd.yml`

How it works:
1. Runs backend API smoke tests in CI
2. Builds and pushes Docker image to GHCR
3. SSH to EC2 and runs `docker compose up -d`

Trigger deployment:
- Push backend changes to `main`, or
- Run workflow manually from GitHub Actions tab

---

## 8) Verify Deployment

On GitHub:
- Open **Actions** and confirm `Backend CI/CD` passed all jobs

On EC2:

```bash
cd /opt/devflow-backend
docker compose ps
docker compose logs -f backend
```

Health check:

```bash
curl http://localhost:3001/api/health
```

Expected: healthy response JSON.

---

## 9) Verify Database Connectivity

From backend logs, confirm no Prisma/PostgreSQL connection errors.

Optional connectivity test from EC2 (install psql client):

```bash
sudo apt install -y postgresql-client
psql "postgresql://devflow_user:<RDS_PASSWORD>@<RDS_ENDPOINT>:5432/devflow"
```

If login works, DB networking is correct.

---

## 10) Common Problems and Fixes

### A) `ECONNREFUSED` to DB
- Check RDS is "Available"
- Confirm RDS SG inbound `5432` from EC2 SG
- Confirm `DATABASE_URL` host/port/password/dbname

### B) GitHub Action deploy fails on SSH
- Verify `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`
- Verify your key matches the key configured on EC2

### C) Container starts then exits
- Check logs:
  - `docker compose logs -f backend`
- Usually missing env var or invalid `DATABASE_URL`

### D) OAuth callback errors
- Callback URL mismatch between GitHub OAuth app and env

---

## 11) Production Hardening (Recommended Next)

1. Put Nginx + HTTPS (Let’s Encrypt) in front of backend
2. Keep RDS private (no public access)
3. Enable RDS automated backups + Multi-AZ (if production critical)
4. Restrict EC2 inbound `3001` (or remove if proxying via 80/443)
5. Use AWS SSM/Secrets Manager for secrets management

---

## 12) Minimal Release Checklist

Before each release:
- RDS status = Available
- `BACKEND_ENV_FILE` is up-to-date
- GitHub Actions permissions/secrets present
- Push to `main` and verify workflow green
- Health endpoint returns success

Done. This gives you a complete AWS-only backend + PostgreSQL setup.
