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

## Deploy on Netlify

This full-stack Next.js app uses API routes and Prisma. Deploy it with Netlify's Next.js runtime; do not enable static export. Netlify detects Next.js automatically and deploys server-rendered pages and API handlers as functions. The repository's `netlify.toml` sets Node.js 22 and the production build command.

1. Push this repository to GitHub, GitLab, or Bitbucket and import it in Netlify. Keep the base directory at the repository root.
2. Create a hosted PostgreSQL database. SQLite is not suitable for production on Netlify because function filesystems are ephemeral. This setup does not migrate existing local SQLite data.
3. Add `DATABASE_URL` (the hosted PostgreSQL connection string) and `JWT_SECRET` (a long, random secret) to the Netlify site's environment variables. Add payment, email, or media-service credentials if those integrations are enabled. Never commit `.env` or expose secrets through `NEXT_PUBLIC_*` variables.
4. Initialize the database schema once before serving traffic with `npm run db:push:netlify`. This generates a PostgreSQL version of the Prisma schema and pushes it to the hosted database. Run `npm run seed:netlify` only if you want the sample data.
5. Deploy. Netlify runs `npm run build`, which generates Prisma Client before building Next.js.

For local development, copy `.env.example` to `.env`, run `npx prisma db push`, then run `npm run dev`. Local development uses SQLite; the dev command generates the matching Prisma Client. For ongoing production schema changes, update the shared Prisma schema and apply the Netlify database command before deploying.
