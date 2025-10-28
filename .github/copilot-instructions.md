# Copilot Instructions - Week 04 Authentication Project

## Architecture Overview

This is a **monorepo** with separate BE (NestJS) and FE (React) folders. Each has independent `package.json` and must be managed separately.

### Key Structural Decisions

- **No shared API client**: Frontend pages call APIs directly using `fetch` + `useMutation` - never create shared API utilities in `FE/src/lib/`
- **No custom hooks**: React Query mutations are defined inline within page components (see `FE/src/pages/SignUp.tsx`)
- **shadcn/ui standard**: Use `@/` path aliases (configured in `FE/vite.config.ts`). Only `FE/src/lib/utils.ts` should exist for the `cn()` helper

## Critical Workflows

### Backend (BE/)
```bash
cd BE
npm install                    # First time or after dependencies change
npx prisma generate            # REQUIRED after moving folders or fresh install
npx prisma migrate dev         # Database migrations
npm run start:dev              # Development server (port 3000)
```

**Important**: After moving `BE/` folder or reinstalling, you MUST run `npx prisma generate` before starting the server, or you'll get `@prisma/client did not initialize` error.

### Frontend (FE/)
```bash
cd FE
npm install
npm run dev                    # Development server (port 5173)
npx shadcn@latest add [name]   # Add new UI components
```

## Project-Specific Conventions

### Backend Patterns

1. **Service location**: Services live in module root (`BE/src/users/users.service.ts`), NOT in `dto/` subfolder
2. **Error handling**: Use NestJS exceptions (`ConflictException`, `NotFoundException`) - see `users.service.ts:16-18` for Prisma P2002 handling
3. **CORS**: Hardcoded to `http://localhost:5173` in `BE/src/main.ts` - update if frontend port changes
4. **Validation**: Global `ValidationPipe` with `whitelist: true` strips unknown properties

### Frontend Patterns

1. **API calls**: Each page component defines its own `mutationFn` inline:
   ```tsx
   const mutation = useMutation({
     mutationFn: async (data) => {
       const response = await fetch(`${API_URL}/endpoint`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         credentials: 'include',
         body: JSON.stringify(data),
       });
       // Error handling...
     },
     onSuccess: () => navigate('/'),
     onError: (error) => setErrorMessage(error.message)
   });
   ```

2. **Form validation**: React Hook Form + Zod schema with `.refine()` for cross-field validation (e.g., password confirmation)

3. **shadcn imports**: Always use `@/components/ui/*` not relative paths. Components auto-generated via CLI already have correct imports.

## Data Flow

```
FE Page → fetch API → BE Controller → Service → Prisma → PostgreSQL
    ↓                      ↓
React Query           NestJS DI Container
useMutation           (auto-injected PrismaService)
```

**Authentication**: No JWT/sessions implemented - just email/password validation. User data stored in `localStorage` on login.

## Integration Points

- **Database**: PostgreSQL connection string in `BE/.env` as `DATABASE_URL`
- **API URL**: Frontend reads from `FE/.env` as `VITE_API_URL` (defaults to `http://localhost:3000`)
- **shadcn config**: `FE/components.json` defines aliases - DO NOT modify unless changing project structure

## Common Pitfalls

1. **Don't create** `FE/src/lib/api.ts` or custom hooks - API logic stays in pages
2. **Don't move** `users.service.ts` into `dto/` folder - services are siblings to controllers
3. **Don't forget** `npx prisma generate` after reinstalling or moving backend folder
4. **Import paths**: Backend uses relative (`../prisma/prisma.service`), frontend uses `@/` alias
