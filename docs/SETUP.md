# Setup Guide

Complete guide for setting up the Casino Intelligence Platform locally.

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18.0 or higher
- **Bun** (recommended) or npm/yarn/pnpm
- **Git** for version control
- **Convex Account** - Sign up at [convex.dev](https://convex.dev)
- **OpenAI API Key** - Get from [platform.openai.com](https://platform.openai.com)
- **Upstash Redis** (optional) - Free tier at [upstash.com](https://upstash.com)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/CS-Martin/project-casino.git
cd project-casino
```

### 2. Install Dependencies

Using Bun (recommended):

```bash
bun install
```

Or using npm:

```bash
npm install
```

### 3. Initialize Convex

```bash
npx convex dev
```

This command will:

- Prompt you to log in to Convex (or create an account)
- Create a new Convex project or connect to an existing one
- Generate `.env.local` automatically with Convex credentials
- Start watching your Convex functions for changes

After completion, verify that `.env.local` contains:

```env
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### 4. Configure Environment Variables

Edit `.env.local` and add the following:

```env
# Convex (auto-generated)
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# OpenAI (required)
OPENAI_API_KEY=sk-your-openai-api-key

# Upstash Redis (optional - for caching)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### 5. Set Convex Environment Variables

The OpenAI API key needs to be available in your Convex backend:

```bash
npx convex env set OPENAI_API_KEY sk-your-openai-api-key
```

To verify:

```bash
npx convex env list
```

### 6. Start Development Server

In a new terminal (keep `npx convex dev` running):

```bash
bun dev
```

Or if you prefer to run both at once:

```bash
bun dev  # This runs both Next.js and Convex concurrently
```

### 7. Access the Application

Open your browser and navigate to:

- **Application**: http://localhost:3000
- **Casino Dashboard**: http://localhost:3000/dashboard/casino
- **Offer Dashboard**: http://localhost:3000/dashboard/offer

### 8. Verify Setup

#### Check Convex Connection

```bash
npx convex dashboard
```

This opens the Convex dashboard in your browser where you can:

- View database tables
- See real-time logs
- Check scheduled cron jobs
- Monitor function calls

#### Test API Endpoints

Casino Discovery:

```bash
curl -X POST http://localhost:3000/api/casinos/research
```

Offer Research:

```bash
curl -X POST http://localhost:3000/api/offers/research/batch \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 5}'
```

## Troubleshooting

### Convex Connection Issues

**Problem**: `npx convex dev` fails to connect

**Solution**:

```bash
# Clear Convex cache and reinitialize
rm -rf .convex
npx convex dev --reset
```

### Missing Environment Variables

**Problem**: Application fails with "OPENAI_API_KEY is not defined"

**Solution**: Ensure the key is set in both places:

1. `.env.local` for Next.js
2. Convex environment (use `npx convex env set`)

### Port Already in Use

**Problem**: Port 3000 or 3001 is already in use

**Solution**:

```bash
# Kill the process using the port
# On macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 bun dev
```

### TypeScript Errors

**Problem**: Type errors after pulling latest changes

**Solution**:

```bash
# Regenerate Convex types
npx convex dev --once

# Or if that doesn't work
rm -rf .convex
npx convex dev
```

### Bun Installation Issues

**Problem**: Bun not installed or not working

**Solution**: Install Bun or use npm:

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Or use npm instead
npm install
npm run dev:client  # In one terminal
npm run dev:server  # In another terminal
```

## Optional: Seed Initial Data

To populate the database with initial casino data:

```bash
# Trigger casino discovery
curl -X POST http://localhost:3000/api/casinos/research

# Or use Convex CLI
npx convex run casinos:scheduledCasinoDiscovery
```

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system
- Check [API.md](./API.md) for API documentation
- See [CONFIGURATION.md](./CONFIGURATION.md) for customization options
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

## Getting Help

If you encounter issues not covered here:

1. Check the [Convex documentation](https://docs.convex.dev)
2. Review [Next.js documentation](https://nextjs.org/docs)
3. Open an issue on GitHub
4. Check existing GitHub issues for solutions
