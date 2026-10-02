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

This is a full-stack Next.js App Router application with server-rendered pages, route handlers, and Prisma. Deploy it as a Next.js application; **do not enable static export**. Netlify's automatically configured OpenNext adapter supports these Next.js features, so do not add or pin a separate Next.js adapter plugin. The root-level `netlify.toml` sets the build command (`npm run build`), Next.js output directory (`.next`), and Node.js 22.

### Netlify setup

1. Push the repository to GitHub, GitLab, or Bitbucket and import it in Netlify. Use the repository root as the base directory.
2. Create a hosted PostgreSQL database. Do not use SQLite in production: Netlify function filesystems are ephemeral, and local SQLite data is not migrated by deployment.
3. In Netlify's **Project configuration → Environment variables**, add both variables for the **Builds** and **Functions** scopes:
   - `DATABASE_URL`: the connection URL for the hosted PostgreSQL database. Prisma Client is generated for PostgreSQL during the build, and the application uses this URL at runtime.
   - `JWT_SECRET`: a unique, cryptographically random secret of at least 32 characters. The application fails immediately if this is missing rather than using an insecure default. Generate one with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`.

   Do not commit real credentials, put secrets in `NEXT_PUBLIC_*` variables, or use the example JWT value in production.
4. Initialize the database schema once before serving traffic. With the production connection URL set in your local shell, run `npm run db:push:netlify`. For example, in PowerShell:

   ```powershell
   $env:DATABASE_URL = "<hosted PostgreSQL connection URL>"
   npm run db:push:netlify
   Remove-Item Env:DATABASE_URL
   ```

   This updates the hosted database schema; it does not import the local SQLite database. Do not run this schema-push command as part of every site build.
5. Deploy using the configured `npm run build` command. The build generates the PostgreSQL Prisma Client and builds Next.js; it does not need to connect to the database. Netlify detects Next.js and configures its adapter automatically.

`npm run seed:netlify` is optional and only for a new, disposable database: the seed script deletes existing records before inserting sample users, products, and orders. Do not run it against production data.

### Local development

Copy `.env.example` to `.env`, replace `JWT_SECRET` with a random development-only value, then run `npx prisma db push` and `npm run dev`. The example configures SQLite for local development; `npm run dev` generates the matching SQLite Prisma Client. For production schema changes, update `prisma/schema.prisma` and explicitly apply the Netlify/PostgreSQL schema update before deploying.
