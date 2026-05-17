# ClawSetup AI

A modern full-stack AI setup service website built with Next.js 15, TypeScript, TailwindCSS, shadcn/ui, Supabase, and Clerk authentication.

## Features

- **Landing Page**: Hero section, features, pricing, testimonials, FAQ, footer
- **Order System**: Form submission with validation, stored in Supabase
- **Admin Dashboard**: Protected dashboard for managing orders
- **Authentication**: Clerk auth with admin-only dashboard access
- **Email Notifications**: Resend integration for admin alerts
- **Responsive Design**: Mobile-first, fully responsive
- **Dark Modern UI**: Premium AI SaaS aesthetic with glassmorphism

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Components**: shadcn/ui
- **Database**: Supabase
- **Auth**: Clerk
- **Email**: Resend
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Clerk account
- Resend account (optional, for email notifications)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/clawsetup-ai.git
cd clawsetup-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend Email
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=admin@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=+1234567890
```

5. Set up the database:
   - Go to your Supabase project
   - Open the SQL Editor
   - Copy and paste the contents of `src/lib/database.sql`
   - Run the SQL to create the orders table

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
clawsetup-ai/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (auth)/            # Auth route group
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Admin dashboard
│   │   ├── order/             # Order pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   ├── robots.ts          # Robots.txt
│   │   └── sitemap.ts         # Sitemap
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── navbar.tsx
│   │   ├── hero.tsx
│   │   ├── features.tsx
│   │   ├── pricing.tsx
│   │   ├── testimonials.tsx
│   │   ├── faq.tsx
│   │   ├── footer.tsx
│   │   ├── order-form.tsx
│   │   ├── whatsapp-button.tsx
│   │   └── status-badge.tsx
│   ├── lib/                   # Utility functions
│   │   ├── utils.ts
│   │   ├── supabase.ts
│   │   ├── auth.ts
│   │   ├── resend.ts
│   │   └── database.sql
│   └── types/                 # TypeScript types
│       └── index.ts
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Configuration

### Clerk Setup

1. Create a project at [Clerk Dashboard](https://dashboard.clerk.dev)
2. Get your API keys from the dashboard
3. Add them to `.env.local`
4. Configure the admin email in `ADMIN_EMAIL` env variable

### Supabase Setup

1. Create a project at [Supabase](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Get your service role key (keep this secret!)
4. Add them to `.env.local`
5. Run the SQL in `src/lib/database.sql` to set up the database

### Resend Setup (Optional)

1. Sign up at [Resend](https://resend.com)
2. Get your API key
3. Add it to `.env.local`
4. Verify your domain in Resend dashboard

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add all environment variables in the Vercel dashboard
4. Deploy!

The project is optimized for Vercel deployment with:
- Edge runtime support
- Automatic image optimization
- Serverless functions

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Customization

### Branding

- Update brand colors in `tailwind.config.ts`
- Change logo in `src/components/navbar.tsx`
- Update content in landing page components

### Pricing

- Edit pricing plans in `src/components/pricing.tsx`

### FAQ

- Edit FAQ items in `src/components/faq.tsx`

## Security Considerations

- Never commit `.env.local` to git
- Use strong passwords for Supabase and Clerk
- Keep your service role key secure
- Enable RLS policies on Supabase tables
- Use HTTPS in production

## License

MIT License - feel free to use this project for your own purposes.

## Support

For support, email support@clawsetup.ai or open an issue on GitHub.
