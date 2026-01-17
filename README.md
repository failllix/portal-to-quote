# Portal to Quote

Portal where users can upload a 3D (`.step` or `.stp`) file and get a quote.

## Local development

1. Install dependencies: `npm run ci`
1. Ensure docker daemon is running
1. Start development servers: `npm run dev`
1. Clone [local .env template](.env.local.example) and insert values
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`: Logged after successful start of local supabase container
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Use the value provided for your Stripe sandbox
   - `STRIPE_SECRET_KEY`: Use the value provided for your Stripe sandbox
1. Restart development servers to ensure correct environment is applied
1. Run initial database migration and apply seed data: `npm run db-update` (secondary shell)
1. Create Policy to allow uploads for the `uploads` bucket using the [Supabase Studio](http://127.0.0.1:54323/project/default/storage/files/policies)
   1. Click "New Policy"
   1. Select "For full customization"
   1. Enter a name for the policy
   1. Make sure `SELECT` and `INSERT` are checked
   1. Click "Review"
   1. Click "Save policy"
1. Access services:
   - Application at [http://localhost:3000](http://localhost:3000)
   - Supabase Studio at [http://localhost:54323](http://localhost:54323)
   - Backend at [http://localhost:3333](http://localhost:3333)

## Deployment

Frontend and backend are currently deployed with Vercel.
They are available at:

- Frontend: [https://portal-to-quote.vercel.app/](https://portal-to-quote.vercel.app/)
- Backend: [https://portal-to-quote-backend.vercel.app/](https://portal-to-quote-backend.vercel.app/)

