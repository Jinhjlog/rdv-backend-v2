# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language Guidelines

**답변 언어**: 모든 응답과 커뮤니케이션은 한국어로 작성하세요.

## Development Commands

### Build and Run

```bash
npm run build              # Build the application
npm run start              # Start in production mode
npm run start:dev          # Start in development mode with file watching
npm run start:debug        # Start with debugging enabled
```

### Code Quality

```bash
npm run lint               # Run ESLint with auto-fix
npm run format             # Format code with Prettier
```

### Testing

```bash
npm test                   # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage report
npm run test:e2e           # Run end-to-end tests
npm run test:debug         # Run tests with debugging
```

### Database Management

```bash
npm run prisma:seed        # Seed database with initial data
npm run prisma:reset       # Reset database and run migrations
npx prisma migrate dev     # Create and run new migration
npx prisma generate        # Generate Prisma client
```

## Architecture Overview

### Domain-Driven Design (DDD) Structure

The codebase follows Clean Architecture with DDD principles, particularly evident in the `group` module:

```
src/group/
├── domain/           # Business logic and entities
│   ├── models/       # Domain entities (Group, GroupMember)
│   └── repositories/ # Repository interfaces
├── application/      # Use cases and application services
│   ├── usecases/     # Business use cases
│   └── dtos/         # Application DTOs
├── infra/           # Infrastructure layer
│   ├── repositories/ # Repository implementations
│   ├── mappers/      # Domain-to-persistence mapping
│   └── services/     # External service integrations
└── presentation/     # API layer
    ├── controllers/  # REST controllers
    └── dtos/         # Request/Response DTOs
```

### Core Infrastructure Components

#### Domain Foundation (`src/lib/domain/`)

- `AggregateRoot`: Base class for domain aggregates
- `Entity`: Base class for domain entities
- `UniqueEntityId`: Value object for entity identification
- `ValueObject`: Base class for value objects

#### Shared Components (`src/shared/`)

- **Exception Handling**: Global exception filter with custom domain exceptions

### Database Architecture

- **ORM**: Prisma with PostgreSQL (Supabase)
- **User Management**: Users, consents, file uploads
- **Group Management**: Groups, group members, invitations, invite codes

### Module Organization

Core modules include:

- `CoreModule`: Database and shared services

## Path Aliases

```typescript
"@lib/*": ["src/lib/*"]      # Domain foundation classes
"@shared/*": ["src/shared/*"] # Shared utilities and decorators
"@prisma/generated/*": ["../prisma/generated/prisma/*"] # Prisma client
```

## Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string (Supabase)
- `DIRECT_URL`: Direct PostgreSQL connection string (for migrations)

## Development Patterns

### Domain Entity Pattern

```typescript
// Domain entities extend AggregateRoot
export class Group extends AggregateRoot<GroupProps> {
  constructor(props: GroupProps) {
    super(props, new UniqueEntityId(props.id));
  }
  // Domain methods...
}
```

### Repository Pattern

```typescript
// Abstract repository in domain
export abstract class GroupRepository {
  abstract save(group: Group): Promise<void>;
}

// Implementation in infrastructure
@Injectable()
export class GroupRepositoryImpl implements GroupRepository {
  async save(group: Group): Promise<void> {
    // Prisma implementation
  }
}
```
