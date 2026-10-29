# Tiffany Guest Registration Portal

## Usanidi
1. Supabase: unda project, endesha `supabase/schema.sql` kwenye SQL Editor.
2. Authentication > Users > Add user (email+password ya admin), kisha endesha SQL ya "ADMIN WA KWANZA" mwishoni mwa schema.sql.
3. `cp .env.example .env.local` na jaza funguo (Project Settings > API).
4. `npm install && npm run dev`
5. Vercel: weka env vars zile zile tatu (SUPABASE_SERVICE_ROLE_KEY bila NEXT_PUBLIC), deploy; domain mf. guests.tiffanydiamondhotels.com
6. Ingia kama Admin > Watumiaji > ongeza user wa kila branch.

## Ruhusa (zinatekelezwa na database - RLS)
- User: anaona na kusajili wageni wa branch yake tu; hawezi kuhariri/kufuta; hawezi kupakua (/api/export ni admin pekee).
- Admin: anaona branch zote, dashboard, CSV kwa kipindi, anaunda users.
