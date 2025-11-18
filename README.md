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

## 📋 API Endpoints

### Health Check

```bash
curl http://localhost:3000/health        # Overall health
```

### Get Notifications

```bash
# Get all notifications
curl http://localhost:3000/notifications

# Filter by userId
curl http://localhost:3000/notifications?userId=1001

# Filter by limitType
curl http://localhost:3000/notifications?limitType=3_USER_DELETIONS

# Filter by both
curl http://localhost:3000/notifications?userId=1001&limitType=3_USER_DELETIONS
```

**Available limit types:**
- `3_USER_DELETIONS`
- `TOP_SECRET_READ`
- `2_USER_UPDATED_IN_1MINUTE`

---

## 🏗️ Architecture & Design Decisions

### Domain-Driven Design (DDD)
- **Layered Architecture**: Clear separation (domain → application → infrastructure → presentation)
- **Domain First**: Business logic isolated from frameworks and external dependencies
- **Value Objects**: Immutable entities like `UserId`, `EventMetadata`, `NotificationId`

### Event Processing
- **In-Memory Storage**: `EventStorageService` keeps recent events per user for fast limit checks
- **Strategy Pattern**: Each limit checker (`ILimitChecker`) is independent and pluggable

### Database Design

**Notifications Collection:**
```typescript
{
  _id: ObjectId,
  userId: string,             // Indexed for fast user queries
  limitType: string,          // "3_USER_DELETIONS" | "TOP_SECRET_READ" | "2_USER_UPDATED_IN_1MINUTE"
  message: string,            // Human-readable description
  eventMetadata: {
    area: string,             // "user" | "payment" | "top-secret"
    action: string,           // "create" | "read" | "update" | "delete"
    timestamp: Date
  },
  createdAt: Date,            // Auto-indexed for time-based queries
}
```

**Indexes:**
- `userId` - Fast user-specific notification lookup
- `limitType` - Fast limit-specific notification lookup
- `createdAt` - Time-range queries and sorting

---

## 📚 Additional Documentation

- [TECHNICAL-TASK.md](./TECHNICAL-TASK.md) - Original requirements