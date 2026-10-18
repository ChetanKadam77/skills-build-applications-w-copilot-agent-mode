# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep the React app focused on rendering route-level card layouts, loading/error/empty states, and user-driven interactions while delegating all HTTP concerns to a shared API client and Vite proxy configuration. This preserves separation from the business logic and data access layers.
- Logic tier decision: Put all request validation, validation errors, aggregation logic, and user lookup logic in the Express service layer rather than deeply embedding it in route handlers. Route handlers should translate domain errors into deliberate HTTP responses such as `400` for malformed input or `404` for missing users.
- Data tier decision: Define required schema constraints in Mongoose models to enforce meaningful user identity, team metadata, activity linkage, and workout suggestion fields. Use MongoDB memory-server tests to validate schema and seed behavior without depending on a local database.
- Activity tracking approach: Store each activity as a link between a user and a team with a type, minutes, computed points, and `occurredAt`. Validate user and team references before persisting so invalid or casted IDs produce a deliberate `4xx` instead of a server error.
- Team management approach: Keep team names and mascots as required fields and maintain `members` as a default empty array. When creating a team, accept member IDs, persist them, and return the stored team document to the frontend without leaking extra internal DB state.
- Leaderboard approach: Aggregate team totals from activity points, sort descending by total points, and assign a 1-based rank to each entry. This keeps the leaderboard deterministic and easy to render for the React UI.
- Workout suggestions approach: Match suggestions to the requested user's email, prefer a workout whose focus aligns to the user's recent activity or goal, and include a reason string explaining the recommendation. If the user email is not found, return a controlled `4xx` such as `404`.

## Test plan

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — validates Mongoose schema requirements, seed idempotency, and the required data contracts for users, teams, activities, and workouts.
- API command: `npm run test:api --prefix octofit-tracker/backend` — catches invalid request handling, missing reference validation, correct JSON shapes, leaderboard ordering, and workout suggestion matching against seeded data.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — ensures the presentation tier renders cards correctly, requests the expected API endpoints, shows loading/empty/error states, and surfaces accessible alert text instead of raw backend details.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — checks that the TypeScript API compiles cleanly with the current route/service/model contracts.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — verifies the Vite/React app builds successfully with TypeScript and the current API contract assumptions.
