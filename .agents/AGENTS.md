# Workspace Instructions for Autonomous Agents

This workspace is an enterprise boilerplate. All coding assistants MUST adhere to the following rules:

1. **Strict TypeScript (Zero `any` Tolerance):**
   - The use of `any` is strictly prohibited. Use explicit interfaces, types, generics, or type-guarded `unknown`.
2. **Component Reuse:**
   - Always use existing UI components located in `frontend/src/components/ui/` (`Button`, `Input`, `Select`, `Modal`, `Table`, `Badge`, `Card`, `Toast`). Do not create redundant custom inputs/buttons.
3. **Database Schema & Migrations:**
   - Always extend `BaseEntity` from `backend/src/core/entities/base.entity.ts`.
   - Never rely on TypeORM `synchronize: true`. Schema modifications must always be committed via TypeORM migrations (`npm run migration:generate` and `npm run migration:run`).
4. **Keycloak RBAC & Security:**
   - Protect NestJS endpoints using `@Roles('ROLE_NAME')` or mark them `@Public()`.
   - Access authenticated user info via `@CurrentUser()`.
5. **Token & Context Optimization (Vibe Coding Best Practices):**
   - Strictly honor `.agentignore` (never read large JSONs like `realm-export.json`, lockfiles, or dist folders into context).
   - Prefer surgical targeted edits over whole-file rewrites to minimize output tokens.
   - Use the root `npm run check` script for fast compiler-driven verification instead of speculating errors.
   - Keep agent responses concise, focused on executable code and state.
6. **Anti-Hardcoding & Dynamic Settings:**
   - Never hardcode limits, external URLs, prices, or business rules in code. Use `ConfigService` for static env and `SystemSettingsService` (`src/core/settings/`) for dynamic admin-editable settings.
7. **Dynamic Feature Flags & Capabilities:**
   - Protect optional or new capabilities with `@RequireFeature('KEY')` on the backend and `<FeatureGate flag="KEY">` on the frontend.
8. **Security & Audit Logging:**
   - Insecure default credentials in `.env` are strictly rejected in production.
   - Record admin modifications and sensitive business operations via `AuditLogService.log(...)`.
9. **Modern Frontend Stack & Server State:**
   - Use `@tanstack/react-query` for all API data fetching, caching, and mutation. Do not use raw `useEffect` with manual loading states.
   - Use `react-hook-form` + `zod` for type-safe validation in forms.
   - Use `recharts` for analytics/charts.
10. **Real-Time WebSockets & Background Queues:**
   - Broadcast entity modifications via `EventsGateway.broadcastEvent(...)` and sync frontend lists with `useLiveSync(...)`.
   - Offload heavy tasks (emails, notifications, batch processing) to BullMQ (`AppQueueModule`).
11. **Self-Verification:**
   - Always run `npm run check` (runs typecheck on both frontend and backend) before completing a feature.
