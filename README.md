# Event Monitor Microservice

A NestJS microservice that consumes Kafka events, checks for limit violations, and stores notifications in MongoDB when limits are exceeded. Built with Domain-Driven Design (DDD) principles.

## 🚀 Tech Stack

- **Node.js** v22.13.1
- **TypeScript** 5.8.2
- **NestJS** 11.x
- **MongoDB** 7.0 with Mongoose
- **Docker & Docker Compose**
- **pnpm** - Package manager
- **Biome** - Linter & formatter

## 📁 Project Structure

```
nestjs-technical-task/
├── apps/
│   └── event-monitor/              # Main NestJS application
│       └── src/
│           ├── domain/             # Business logic & entities
│           ├── application/        # Use cases & orchestration
│           ├── infrastructure/     # Database, messaging, config
│           └── presentation/       # Controllers & HTTP layer
│       └── Dockerfile              # Dockerfile for the application
├── docker-compose.yml              # Infrastructure setup
└── pnpm-workspace.yaml             # Monorepo configuration
```

## 🛠️ Prerequisites

- Node.js >= 22.13.1
- pnpm >= 9.x
- Docker & Docker Compose

## 📦 Installation & Running

### Quick Start (Docker - Recommended)

```bash
# Clone repository
git clone https://github.com/AD12-codes/nestjs-technical-task.git
cd nestjs-technical-task

# Install dependencies (for scripts)
pnpm install

# Start EVERYTHING with one command 🚀
pnpm docker:up-all
```

That's it! The entire stack (MongoDB, Kafka, and App) is now running.

**Services:**
- **Application:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **Kafka UI:** http://localhost:8080
- **Mongo Express:** http://localhost:8081 (admin/admin123)

### Local Development Mode

```bash
# Start infrastructure only
pnpm docker:up

# Start application locally (with hot reload)
pnpm dev:event-monitor
```

### Available Commands

```bash
# Development
pnpm dev:event-monitor       # Start dev server
pnpm build:event-monitor     # Build for production

# Docker
pnpm docker:up-all           # Start EVERYTHING (recommended)
pnpm docker:up               # Start infrastructure only
pnpm docker:down             # Stop all services
pnpm docker:logs             # View all logs
pnpm docker:app-logs         # View app logs only
pnpm docker:ps               # List containers

# Testing
pnpm test:event-monitor      # Run unit tests
pnpm test:e2e                # Run E2E tests
pnpm test-producer           # Send test events

# Code Quality
pnpm check:fix               # Format & lint
```

## 🏥 Health Check

```bash
curl http://localhost:3000/health        # Overall health
curl http://localhost:3000/health/ready  # Readiness probe
curl http://localhost:3000/health/live   # Liveness probe
```