# Event Monitor Microservice

A NestJS microservice for monitoring system events from Kafka and storing notifications in MongoDB, built with Domain-Driven Design principles.

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
├── packages/                       # Shared libraries (future)
├── docker-compose.yml              # Infrastructure setup
└── pnpm-workspace.yaml             # Monorepo configuration
```

## 🛠️ Prerequisites

- Node.js >= 22.13.1
- pnpm >= 9.x
- Docker & Docker Compose

## 📦 Installation & Running

### Clone Repository

```bash
git clone https://github.com/AD12-codes/nestjs-technical-task.git
cd nestjs-technical-task
```

### Install Dependencies

```bash
pnpm install
```

### Start with Docker

```bash
# Start infrastructure (MongoDB + Mongo Express)
pnpm docker:up

# Start application
pnpm dev:event-monitor
```

**Services:**
- Application: http://localhost:3000
- Mongo Express: http://localhost:8081 (admin/admin123)
- MongoDB: localhost:27017

### Available Commands

```bash
# Development
pnpm dev:event-monitor       # Start dev server
pnpm build:event-monitor     # Build for production

# Docker
pnpm docker:up               # Start all services
pnpm docker:down             # Stop all services
pnpm docker:logs             # View logs
pnpm docker:ps               # List containers

# Code Quality
pnpm check:fix               # Format & lint
```

## 🏥 Health Check

```bash
curl http://localhost:3000/health        # Overall health
curl http://localhost:3000/health/ready  # Readiness probe
curl http://localhost:3000/health/live   # Liveness probe
```

## 📄 License

UNLICENSED
