# QuizMaster Platform

A full-stack real-time MCQ quiz platform built with Next.js 14, TypeScript, Supabase, and Prisma.

## Features

- 🔐 Secure authentication with Supabase Auth
- 📊 Real-time leaderboards with live updates
- ⏱️ Timed quiz sessions with auto-submission
- 🎯 Instant answer feedback with animations
- 📱 Responsive design with Tailwind CSS
- 🔒 Row Level Security (RLS) for data protection

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, ShadCN/UI, Framer Motion
- **Backend**: Supabase (Auth, Database, Realtime), Prisma ORM
- **Database**: PostgreSQL
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- PostgreSQL database (via Supabase)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd quizmaster-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`

4. Set up the database:
   ```bash
   npm run db:push
   npm run db:generate
   npm run db:seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── quiz/              # Quiz interface
│   ├── leaderboard/       # Leaderboard page
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # ShadCN/UI components
│   ├── auth/              # Authentication components
│   ├── quiz/              # Quiz-related components
│   └── leaderboard/       # Leaderboard components
├── lib/                   # Utility functions
│   ├── supabase/          # Supabase client configuration
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # General utilities
└── middleware.ts          # Next.js middleware for auth

docs/                      # Project documentation
├── CLERK_SETUP.md         # Clerk authentication setup
├── DATABASE_FIX_INSTRUCTIONS.md # Database troubleshooting
├── MIGRATION_SUMMARY.md   # Migration documentation
└── ...                    # Other documentation files

sql/                       # Database scripts
├── create_tables.sql      # Initial schema creation
├── supabase_rls_policies.sql # RLS policies
└── ...                    # Other SQL scripts

scripts/                   # Utility scripts
├── seed-main-questions.ts # Main questions seeding
└── seed-unit-1-table.ts   # Unit-specific seeding
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## Additional Scripts

- `npx tsx scripts/seed-unit-1-table.ts` - Seed unit-specific questions

## Documentation

All project documentation is organized in the `docs/` directory:

- **Setup Guides**: Clerk authentication, database configuration
- **Migration Docs**: Authentication migration summaries
- **Troubleshooting**: Database fixes, rate limiting solutions

## Database Scripts

SQL scripts are organized in the `sql/` directory:

- **Schema**: Table creation and database setup
- **Security**: Row Level Security policies
- **Maintenance**: User cleanup and data migration scripts

## Development Status

This project is currently under development. Features are being implemented according to the specification in `.kiro/specs/quizmaster-platform/`.

## License

This project is private and proprietary.