# Tasky Server — Express + Prisma + PostgreSQL

## Architecture

```
server/
├── prisma/
│   └── schema.prisma        # Database models
├── src/
│   ├── controllers/          # Request handlers (functional style)
│   │   ├── auth.controller.ts
│   │   ├── membership.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── organization.controller.ts
│   │   ├── reminder.controller.ts
│   │   └── task.controller.ts
│   ├── lib/
│   │   └── prisma.ts         # Prisma client singleton
│   ├── middleware/
│   │   ├── auth.middleware.ts # JWT authentication
│   │   └── error.middleware.ts
│   ├── routes/               # Express routers
│   │   ├── auth.routes.ts
│   │   ├── membership.routes.ts
│   │   ├── notification.routes.ts
│   │   ├── organization.routes.ts
│   │   ├── reminder.routes.ts
│   │   └── task.routes.ts
│   ├── utils/
│   │   ├── invite-code.ts
│   │   ├── jwt.ts
│   │   └── validation.ts     # Zod schemas
│   └── index.ts              # Entry point
├── .env.example
├── package.json
└── tsconfig.json
```

## Setup

1. Copy `.env.example` to `.env` and configure PostgreSQL connection
2. `npm install`
3. `npx prisma generate`
4. `npx prisma migrate dev --name init`
5. `npm run dev`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| POST | /api/organizations | Create organization |
| GET | /api/organizations | List user orgs |
| GET | /api/organizations/:id | Get org details |
| POST | /api/memberships/join | Join via invite code |
| GET | /api/memberships/:orgId/members | List members |
| POST | /api/tasks | Create task |
| GET | /api/tasks | List tasks (with filters) |
| PATCH | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| POST | /api/reminders | Send reminder |
| GET | /api/reminders/:orgId | List reminders |
| GET | /api/notifications | Get notifications |
| PATCH | /api/notifications/:id/read | Mark read |
| PATCH | /api/notifications/read-all | Mark all read |

## Database Models

- **User** — Authentication, roles (ADMIN/USER)
- **Organization** — Teams with invite codes
- **Membership** — User-org join table with roles
- **Task** — Tasks with status, priority, assignment
- **Reminder** — Admin-sent task reminders
- **Notification** — User notifications (reminders, assignments, updates)
