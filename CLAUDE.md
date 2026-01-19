# CLAUDE.md - AI Assistant Guidelines for Team Finder

This document provides guidelines for AI assistants (like Claude) working on this codebase.

## Project Overview

Team Finder is a web application that helps game jam participants find teammates. It consists of:

- **UI** (`/ui`): React 19 + TypeScript + Vite frontend on port 3000
- **API** (`/api`): Kotlin/Ktor REST API on port 8080
- **DB**: MongoDB database

The project is designed to be **modular and forkable** so communities can adapt it for their own game jams.

## Critical Rules

### 1. Always Run Tests Before Commits

**Never commit code without ensuring all tests pass.**

```bash
# UI tests (from /ui directory)
npm run typecheck    # TypeScript type checking
npm run cy:run       # Cypress E2E tests (requires dev server running)

# API tests (from /api directory)
./gradlew test       # Kotlin unit tests
```

Before any commit:
1. Run the relevant test suite for your changes
2. Fix any failing tests
3. Only then proceed with the commit

### 2. Maintain Modularity

This project is designed for others to fork and customize. When making changes:

- Keep components self-contained and reusable
- Use configuration/environment variables for jam-specific values (not hardcoded)
- Document any new configuration options in `.env.example`
- Avoid tight coupling between unrelated features

## Project Structure

```
team-finder/
├── ui/                     # React frontend
│   ├── src/
│   │   ├── api/            # API clients and hooks
│   │   ├── common/         # Shared components and models
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── models/     # TypeScript types and enums
│   │   │   └── utils/      # Utility functions
│   │   └── pages/          # Page components (route-based)
│   └── cypress/            # E2E tests
│       ├── e2e/            # Test specs
│       ├── fixtures/       # Mock data
│       └── support/        # Custom commands
├── api/                    # Kotlin backend
│   └── src/main/kotlin/com/gmtkgamejam/
│       ├── models/         # Data models and DTOs
│       ├── repositories/   # Database access
│       ├── routing/        # API route handlers
│       └── services/       # Business logic
└── db/                     # Database scripts and seeds
```

## Tech Stack

### UI
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS
- **State Management**: TanStack React Query v5
- **Forms**: Formik
- **Routing**: React Router v7
- **Testing**: Cypress (E2E)

### API
- **Language**: Kotlin
- **Framework**: Ktor
- **Build Tool**: Gradle
- **Database**: MongoDB

## Development Commands

### UI (`/ui` directory)

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run typecheck    # TypeScript checking
npm run lint         # ESLint
npm run cy:open      # Open Cypress UI
npm run cy:run       # Run Cypress headlessly
```

### API (`/api` directory)

```bash
./gradlew build      # Build the API
./gradlew run        # Run the API
./gradlew test       # Run tests
```

### Docker (root directory)

```bash
docker compose up -d              # Start all services
docker compose up -d api db ui    # Start specific services
docker compose up --build -d      # Rebuild and start
```

## Code Conventions

### TypeScript/React

- Use functional components with hooks
- Prefer named exports over default exports
- Use TypeScript strict mode (enabled in tsconfig)
- Keep components focused and single-purpose

### Enums and Constants

Skills, tools, languages, and timezones use specific value formats:

| Type | Format | Examples |
|------|--------|----------|
| Skills | UPPER_SNAKE_CASE | `ART_2D`, `CODE`, `DESIGN_PRODUCTION`, `MUSIC` |
| Tools | UPPER_SNAKE_CASE | `UNITY`, `GODOT`, `GAME_MAKER_STUDIO` |
| Languages | ISO codes | `en`, `es`, `fr`, `ja`, `pt-BR` |
| Timezones | Numeric strings | `-5`, `0`, `1`, `9` |

### API Endpoints

- Posts: `/posts`, `/posts/:id`, `/posts/favourites`
- Auth: `/userinfo`, `/login/authorized`
- Favourites: `/favourites`

## Testing Guidelines

### Cypress E2E Tests

- Mock all API calls using `cy.intercept()`
- Use fixtures for consistent test data
- Test both authenticated and unauthenticated states
- Custom commands available: `cy.login()`, `cy.mockApi()`, `cy.mockApiAuthenticated()`, `cy.visitHome()`

### Test Organization

```
cypress/e2e/
├── home.cy.ts           # Home page and pagination
├── search.cy.ts         # Search and filtering
├── post-detail.cy.ts    # Single post view
├── create-post.cy.ts    # Post creation
├── edit-post.cy.ts      # Post editing
├── authentication.cy.ts # Auth flows
├── bookmarks.cy.ts      # Favourites feature
└── mobile.cy.ts         # Responsive design
```

## Environment Variables

Key environment variables (see `.env.example` for full list):

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | API base URL for frontend |
| `API_URL` | API URL for backend |
| `UI_URL` | Frontend URL |
| `DATABASE_URL` | MongoDB connection string |
| `DISCORD_CLIENT_ID` | Discord OAuth app ID |
| `DISCORD_CLIENT_SECRET` | Discord OAuth secret |

## Authentication

- Uses Discord OAuth for user authentication
- Auth token stored in localStorage under key `team_finder_auth`
- API validates token via `/userinfo` endpoint

## Common Tasks

### Adding a New Page

1. Create component in `ui/src/pages/{pagename}/{PageName}.tsx`
2. Add route in `ui/src/AppRoutes.tsx`
3. Add Cypress tests in `ui/cypress/e2e/{pagename}.cy.ts`

### Adding a New Skill/Tool Option

1. Update the API enum first:
   - Skills: `api/src/main/kotlin/com/gmtkgamejam/models/posts/Skills.kt`
   - Tools: `api/src/main/kotlin/com/gmtkgamejam/models/posts/Tools.kt`
2. Update the corresponding UI model in `ui/src/common/models/skills.tsx` or `engines.tsx`
3. Add corresponding icon in `ui/src/common/utils/getOptionsListIcon.tsx`
4. Update Cypress fixtures with new enum values

### Adding an API Endpoint

1. Create DTO in `api/src/main/kotlin/.../models/`
2. Add repository method if needed
3. Create route in `api/src/main/kotlin/.../routing/`
4. Add service logic in `api/src/main/kotlin/.../services/`
5. Write tests

## CI/CD

GitHub Actions workflows:
- **UI**: Runs on changes to `/ui/**` - typecheck + Cypress tests
- **API**: Runs on changes to `/api/**` - Gradle tests

Both workflows run on PRs and pushes (except main branch).

## Debugging Tips

- UI hot-reload works in Docker via Vite
- MongoDB viewer available at `localhost:8081` when running `db-viewer`
- Check browser DevTools Network tab for API issues
- Cypress videos saved in `cypress/videos/` on test runs

## Important Reminders

1. **Test before commit** - Always run tests relevant to your changes
2. **Keep it modular** - Design for forkability
3. **Use correct enum formats** - Check the enums table above
4. **Mock APIs in tests** - Don't depend on real backend for E2E tests
5. **Update fixtures** - When adding features, update test fixtures accordingly
