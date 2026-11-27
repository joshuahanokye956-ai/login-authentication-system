# Login Authentication System (Next.js + Neon + Vercel)
1. Push to GitHub, import into Vercel.
2. Add a Neon Postgres database (Vercel > Storage) and a Vercel Blob store (Vercel > Storage).
3. Set env vars from `.env.example` (DATABASE_URL, PEPPER, JWT_SECRET, ADMIN_EMAIL, CRON_SECRET). Blob token is added automatically.
4. Deploy. Register with ADMIN_EMAIL to get the admin account. Tables are created automatically.
