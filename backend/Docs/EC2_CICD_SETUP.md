# Backend CI/CD to AWS EC2 (Docker)

This guide explains how to use the GitHub Actions workflow in `.github/workflows/backend-cicd.yml`.

## What the pipeline does

1. Runs backend API smoke tests against all routes listed in Swagger (`/api-docs.json`)
2. Builds and pushes a Docker image to GHCR (`ghcr.io/<owner>/devflow-backend`)
3. Deploys the latest image to your EC2 instance using Docker Compose

## 1) EC2 server prerequisites

Run on EC2 once:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
sudo mkdir -p /opt/devflow-backend
sudo chown -R $USER:$USER /opt/devflow-backend
```

Open inbound security group rules for your API port (default `3001`).

## 2) GitHub repository settings

Go to **Settings → Actions → General** and allow workflows to read/write packages.

## 3) Required GitHub Secrets

Add these repo secrets:

- `EC2_HOST` - Public IP or DNS of EC2 instance
- `EC2_USER` - SSH user (example: `ubuntu`)
- `EC2_SSH_KEY` - Private key content for EC2 SSH
- `BACKEND_ENV_FILE` - Full backend `.env` content (multiline)

Example `BACKEND_ENV_FILE` value:

```dotenv
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db>?schema=public
GITHUB_CLIENT_ID=<github_client_id>
GITHUB_CLIENT_SECRET=<github_client_secret>
GITHUB_CALLBACK_URL=https://<your-domain>/api/auth/github/callback
JWT_SECRET=<strong_secret>
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://<your-frontend-domain>
```

## 4) Container registry notes

The workflow publishes image tags:

- `ghcr.io/<owner>/devflow-backend:latest`
- `ghcr.io/<owner>/devflow-backend:sha-<commit>`

## 5) Triggering deployment

- Push to `main` with backend changes, or
- Run workflow manually from Actions tab (`workflow_dispatch`)

## 6) Verify deployment on EC2

```bash
cd /opt/devflow-backend
docker compose ps
docker compose logs -f backend
curl http://localhost:3001/api/health
```

## 7) Rollback (quick)

```bash
cd /opt/devflow-backend
export IMAGE=ghcr.io/<owner>/devflow-backend:sha-<previous_commit>
docker compose up -d
```
