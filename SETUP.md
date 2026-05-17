
# ClawSetup AI - Setup Guide

This guide will walk you through setting up ClawSetup AI from scratch.

## Step 1: Prerequisites

Before you begin, ensure you have:
- Node.js 18 or higher installed
- A code editor (VS Code recommended)
- Git installed
- Accounts on the following services:
  - [Clerk](https://clerk.dev) (for authentication)
  - [Supabase](https://supabase.com) (for database)
  - [Resend](https://resend.com) (for email - optional)

## Step 2: Project Setup

### 2.1 Install Dependencies

```bash
# Navigate to the project directory
cd clawsetup-ai

# Install all dependencies
npm install
```

### 2.2 Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Open `.env.local` in your editor and fill in the values

## Step 3: Clerk Authentication Setup

### 3.1 Create a Clerk Project

1. Go to [Clerk Dashboard](https://dashboard.clerk.dev)
2. Click "Create Application"
3. Name it "ClawSetup AI"
4. Select "Next.js" as the framework
5. Complete the setup

### 3.2 Get Your API Keys

1. In your Clerk dashboard, go to "API Keys"
2. Copy the "Publishable key" and "Secret key"
3. Paste them into your `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3.3 Configure Admin Access

1. In `.env.local`, set your admin email:
```env
ADMIN_EMAIL=your-email@example.com
```

2. Only users with this email will be able to access the dashboard.

## Step 4: Supabase Database Setup

### 4.1 Create a Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Click "New Project"
3. Name it "clawsetup-ai"
4. Choose a region close to your users
5. Wait for the project to be created

### 4.2 Get Your API Keys

1. In your Supabase dashboard, go to Project Settings > API
2. Copy the following values:
   - Project URL
   - `anon` public API key
   - `service_role` secret key (under "Project API keys")

3. Paste them into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

⚠️ **Important**: Never expose the service role key in client-side code!

### 4.3 Create the Database Schema

1. In your Supabase dashboard, go to the "SQL Editor"
2. Click "New query"
3. Copy and paste the contents of `src/lib/database.sql`
4. Click "Run"

This will create:
- The `orders` table
- Proper indexes for performance
- Row Level Security policies
- Automatic timestamp updates

### 4.4 Enable Row Level Security (RLS)

The SQL script already includes RLS policies, but verify they were created:

1. Go to Database > Tables > orders
2. Click on "Policies"
3. You should see:
   - "Allow public insert" - allows anyone to create orders
   - "Allow users to read own orders" - users can see their own orders

## Step 5: Resend Email Setup (Optional)

If you want to receive email notifications when new orders are submitted:

### 5.1 Create a Resend Account

1. Go to [Resend](https://resend.com)
2. Sign up for an account
3. Verify your email

### 5.2 Get Your API Key

1. In Resend dashboard, go to API Keys
2. Create a new API key
3. Copy the key

### 5.3 Configure Environment Variables

Add to `.env.local`:

```env
RESEND_API_KEY=re_...
ADMIN_EMAIL=admin@yourdomain.com
```

### 5.4 Verify Your Domain (Recommended)

1. In Resend dashboard, go to Domains
2. Add and verify your domain
3. This improves email deliverability

## Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 7: Test Everything

### 7.1 Test the Landing Page

- Visit the homepage
- Check all sections load properly
- Verify responsive design on mobile

### 7.2 Test Order Submission

1. Go to `/order`
2. Fill out the form with test data
3. Submit the order
4. Check Supabase to verify the order was created

### 7.3 Test Admin Dashboard

1. Sign in with your admin email at `/sign-in`
2. You should be redirected to `/dashboard`
3. You should see the order you just created
4. Try updating the order status
5. Try deleting an order

### 7.4 Test Email Notifications (if configured)

1. Submit a new order
2. Check if you receive an email notification

## Common Issues

### Issue: "Cannot find module" errors

**Solution**: Make sure you've run `npm install`

### Issue: "Invalid API key" errors

**Solution**: Double-check your environment variables are correct

### Issue: Database connection errors

**Solution**: 
- Verify your Supabase URL and anon key
- Check if your Supabase project is active
- Ensure RLS policies are properly configured

### Issue: Cannot access dashboard

**Solution**:
- Make sure you're signed in
- Verify your email matches the `ADMIN_EMAIL` in `.env.local`
- Check Clerk dashboard to see if the user exists

## Production Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add all environment variables from `.env.local`
5. Deploy!

### Environment Variables for Production

Make sure to add these to your Vercel project settings:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ADMIN_EMAIL`
- `NEXT_PUBLIC_APP_URL` (your production URL)
- `NEXT_PUBLIC_WHATSAPP_NUMBER`

## Next Steps

After setup, consider:

1. **Customize the content** - Update landing page text, pricing, testimonials
2. **Add your branding** - Update colors, logo, favicon
3. **Set up analytics** - Add Google Analytics or similar
4. **Configure domain** - Set up your custom domain on Vercel
5. **Add payment processing** - Integrate Stripe for automatic payments
6. **Set up monitoring** - Add error tracking with Sentry

## Need Help?

If you run into issues:

1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Review [Clerk documentation](https://clerk.com/docs)
3. Read [Supabase documentation](https://supabase.com/docs)
4. Open an issue on GitHub

## Security Checklist

Before going live:

- [ ] Environment variables are set in production
- [ ] Service role key is NOT exposed to client
- [ ] RLS policies are enabled on Supabase
- [ ] Clerk production keys are used
- [ ] Domain is configured in Clerk
- [ ] HTTPS is enabled
- [ ] Strong passwords are used for all accounts
- [ ] `.env.local` is in `.gitignore`
