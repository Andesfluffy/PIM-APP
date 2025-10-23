<!-- HEAD
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

# Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# PIM-APP

e61cb67e5237cc1a1da6044d931b563ee7b99adf -->

# Next.js Starter Project

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open http://localhost:3000 with your browser to see the result.

You can start editing the page by modifying app/page.tsx. The page auto-updates as you edit the file.

This project uses next/font to automatically optimize and load Geist, a new font family for Vercel.

Learn More
To learn more about Next.js, take a look at the following resources:

Next.js Documentation - learn about Next.js features and API.

Learn Next.js - an interactive Next.js tutorial.

You can check out the Next.js GitHub repository - your feedback and contributions are welcome!

Deploy on Vercel
The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js.

Check out the Next.js deployment documentation for more details.

## PIM-APP

This project provides a simple personal information manager built with Next.js and Vercel Postgres. The API routes under `src/app/api/` connect directly to the hosted database, so you no longer need a separate Azure Functions deployment.

### Database Setup

1. **Create a database** – In the Vercel dashboard, provision a Postgres database for your project.
2. **Copy environment variables** – Add the `POSTGRES_URL` (and optionally `POSTGRES_URL_NON_POOLING`) variables to your Vercel project and to a local `.env.local` file when developing locally.
3. **Run the migrations** – The API layer lazily creates the required tables on first use, so no manual migrations are required. Hitting `/api/test-db` is enough to provision the schema.

### Local environment

Create a `.env.local` file with the Postgres connection string supplied by Vercel:

```bash
POSTGRES_URL="postgres://..."
```

With the variable in place you can run `npm run dev` and access the application at [http://localhost:3000](http://localhost:3000). The `/api/test-db` endpoint returns a JSON payload confirming the connection to Vercel Postgres.
