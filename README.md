# Expose Trendze Customer App

React Native + Expo mobile app for Expose Trendze customers, built from the supplied specification, database, and UI guide documents.

## Included

- Two login variants on the same screen: customer and admin
- Dashboard with summary cards, active orders, and recent activity
- Order history with search and status filters
- Order detail view with products, payment status, and timeline summary
- Live tracking screen with the 11-stage order pipeline
- Admin panel to manually control customer-visible order stages
- Profile screen with support and logout actions
- Supabase-ready auth and data services
- Demo fallback mode when environment variables are not configured yet

## Run

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and set:

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

3. Start Expo:

```bash
npm start
```

## Demo Mode

If `.env` values are missing, the app boots with styled demo data so the UI can be reviewed immediately.

Demo login:

- Email: `ava.sterling@et-demo.com`
- Password: `demo1234`

Admin demo login:

- Email: `admin@et-demo.com`
- Password: `admin1234`

## Supabase Notes

- Public signups should remain disabled
- Customers table must map `auth.users.id` to `customers.user_id`
- Admins table must map `auth.users.id` to `admins.user_id`
- Realtime should be enabled for `orders` and `order_stages`
- SQL bootstrap is included in `supabase/schema.sql`
