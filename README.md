# Portal to Quote

Portal where users can upload a 3D (`.step` or `.stp`) file and get a quote.

## Local development

1. Install dependencies: `npm ci`
1. Ensure docker daemon is running
1. Start development servers: `npm run dev`
1. Clone [local .env template](.env.local.example), rename to `.env.local` and insert values:
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`: Logged after successful start of local supabase container (or get with `npx supabase status` in separate shell)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Use the value provided for your Stripe sandbox
   - `STRIPE_SECRET_KEY`: Use the value provided for your Stripe sandbox
1. Run initial database migration and apply seed data: `npm run db-update` (in secondary shell)
1. Access services:
   - Application at [http://localhost:3000](http://localhost:3000)
   - Supabase Studio at [http://localhost:54323](http://localhost:54323)
   - Backend at [http://localhost:3333](http://localhost:3333)

A [Bruno collection](./bruno/Portal-to-Quote/) is available to interact conveniently with the Backend API.

Test files are provided in the [public folder](./public/).

## Deployment

Frontend and backend are currently deployed with Vercel.
They are available at:

- Frontend: [https://portal-to-quote.vercel.app/](https://portal-to-quote.vercel.app/)
- Backend: [https://portal-to-quote-backend.vercel.app/](https://portal-to-quote-backend.vercel.app/)

CREATE POLICY "Allow Public Select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'uploads');
CREATE POLICY "Allow Public Upload" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'uploads');
