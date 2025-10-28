# Week04 - User Registration API with React Frontend

Authentication system with NestJS backend and React frontend.

```
week04-signUp/
├── BE/                   # Backend (NestJS)
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── users/        # User management
│   │   │   ├── dto/      # Data Transfer Objects
│   │   │   ├── users.service.ts
│   │   │   ├── users.controller.ts
│   │   │   └── users.module.ts
│   │   ├── prisma/       # Database service
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/           # Database schema & migrations
│   ├── .env              # Backend environment variables
│   ├── package.json      # Backend dependencies
│   └── tsconfig.json
│
├── FE/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/ui/ # shadcn/ui components
│   │   ├── lib/          # Utilities (cn helper)
│   │   ├── pages/        # Page components (API logic here)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env              # Frontend environment variables
│   ├── package.json      # Frontend dependencies
│   └── vite.config.ts
│
└── README.md             # This file
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

## API Endpoints
- `POST /user/register` - Register user
- `GET /user/list` - Get all users
- `POST /auth/login` - User login

## Environment Variables

### Backend (BE/.env)
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Frontend (FE/src/.env)
```bash
VITE_API_URL=http://localhost:3000
VITE_API_USER_REGISTER=/user/register
VITE_API_USER_LIST=/user/list
VITE_API_AUTH_LOGIN=/auth/login
```

### Backend Setup (NestJS)
```bash
cd BE
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
# Backend runs on http://localhost:3000 (configured in BE/.env)
```

### Frontend Setup (React + Vite)
```bash
cd FE
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### Database
Update `BE/.env` with your PostgreSQL connection:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

## Tech Stack
- **Backend**: NestJS, Prisma, PostgreSQL
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn/ui

## Troubleshooting
- **Prisma error**: Run `npx prisma generate`
- **Port conflict**: Change `PORT` in `BE/.env`
- **API calls fail**: Check `VITE_API_URL` matches backend port
