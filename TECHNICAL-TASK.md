# Technical Test

## Tech Stack

- [Node.js](https://nodejs.org/en/) - >=22.13.1
- [Typescript](https://www.typescriptlang.org/)
- [NestJS](https://nestjs.com/)
- [Docker](https://www.docker.com/)
- [Kafka](https://kafka.apache.org/)
- [MongoDB](https://www.mongodb.com/)

## Description

We have a Kafka stream that logs all actions performed in the system. Messages are categorized by area and action. The known areas are: `user`, `payment`, and `top-secret`, while the possible actions are: `create`, `read`, `update`, and `delete` (`CRUD`). Each message is associated with a user via its `userId`.

### Example message

```json
{
  "userId": 83,
  "scope": "user.delete",
  "date": "2025-04-01T05:19:30.478Z"
}
```

You can generate test messages using the `./test-producer.ts` script:

```sh
KAFKA_BROKERS={{ BROKER_URL }} npm run test-producer
```

Make sure to replace {{ BROKER_URL }} with the actual Kafka broker URL.

### Task

Your task is to create a microservice that tracks system events and generates a notification in a MongoDB database when a limit is exceeded. These notifications should include the `user`, `date`, and type of `limit` that was surpassed.

### Limits

| Name                      | Description                                     |
| ------------------------- | ----------------------------------------------- |
| 3_USER_DELETIONS          | An user deleted 3 resources in a row            |
| TOP_SECRET_READ           | An user made a read to `top-secret` resource    |
| 2_USER_UPDATED_IN_1MINUTE | An user updated 2 users in a 1 minute timeframe |

### Extensibility

Since requirements may evolve over time, the system should be flexible enough to allow new limits to be defined or for other applications to consume this information for different purposes.

## Requirements / Goals

### 1. Monorepo

Set up a monorepo-based project using the technology of your choice (`pnpm`, `nx`, `turborepo`, etc.).

- Create applications and libraries needed for the test.

### 2. Microservice

Add a NestJS application in Monorepo

- Implement Consumer logic to process events and check limits.
- When a limit is exceeded, store a `notification` in the MongoDB `notifications` collection.

**NOTES**:
- Ensure the required infrastructure is available by providing a `docker-compose.yml`.
- Make any necessary changes to the repository to develop the test.

### 3. Architecture

Design a **scalable and maintainable architecture** that meets both current and future requirements. Consider **Domain-Driven Design (DDD)** to structure the system effectively. Apply industry **best practices, design patterns, and methodologies** to ensure flexibility and long-term maintainability.

### 4. Performance

The system must efficiently handle a **high volume of events**, process them in real-time, and generate notifications with minimal latency. Optimize for throughput and responsiveness.

### 5. Testing

Ensure the system behaves as expected by writing comprehensive tests. You are free to use any testing framework of your choice. Cover critical functionality, including edge cases and performance constraints.

### 6. Documentation

Provide **clear and concise documentation** covering:

- System architecture and design choices
- How to set up and run the application
- Testing procedures
- Infrastructure and deployment details
