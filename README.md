# Tiffany Guest Registration Portal

## Setup
1. Supabase: create a project and run `supabase/schema.sql` in the SQL Editor.
2. Authentication > Users > Add user (admin email + password), then run the "FIRST ADMIN" SQL at the end of schema.sql.
3. `cp .env.example .env.local` and fill in the keys (Project Settings > API).
4. `npm install && npm run dev`
5. Vercel: set the same three env vars (SUPABASE_SERVICE_ROLE_KEY without NEXT_PUBLIC) and deploy.
6. Sign in as Admin > Users > add a user for each branch.

## Permissions (enforced by the database via RLS)
- User: sees and registers guests of their own branch only; cannot edit/delete; cannot download (/api/export is admin-only).
- Admin: sees all branches, dashboard, PDF report for a date range, creates users.
