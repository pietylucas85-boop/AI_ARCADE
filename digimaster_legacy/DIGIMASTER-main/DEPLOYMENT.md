# DigiMaster Deployment Guide

## Overview
DigiMaster is a complete full-stack SaaS platform for managing websites, CRM, campaigns, and digital marketing. This guide will walk you through deploying it to digimaster.com.

## Prerequisites
- Domain: digimaster.com
- Supabase account (database already configured)
- Vercel/Netlify account (or any hosting provider)
- Environment variables from Supabase

## Step 1: Verify Environment Variables

Make sure your `.env` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These should already be configured from your Supabase setup.

## Step 2: Database Setup

Your database tables are already created with the following structure:

### Tables:
- **users**: User accounts with plans (free/pro/agency)
- **contacts**: CRM contacts with tags and notes
- **campaigns**: Email/SMS campaigns with analytics
- **websites**: Website builder data
- **chat_messages**: Eve AI conversation history

All tables have Row Level Security (RLS) enabled and are properly configured.

## Step 3: Deploy to Vercel (Recommended)

### Option A: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow prompts:
   - Link to existing project or create new
   - Set project name: `digimaster`
   - Add environment variables when prompted

5. Deploy to production:
```bash
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project:
   - Framework: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

## Step 4: Configure Custom Domain

### In Vercel:
1. Go to your project settings
2. Navigate to "Domains"
3. Add domain: `digimaster.com`
4. Add domain: `www.digimaster.com`
5. Follow DNS configuration instructions

### DNS Configuration:
Add these records in your domain registrar:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

Note: Vercel will provide specific DNS records. Use those instead.

## Step 5: Test Your Deployment

1. Visit https://digimaster.com
2. Test signup flow:
   - Go to /signup
   - Create an account
   - Verify redirect to dashboard
3. Test all features:
   - Add a contact
   - Create a campaign
   - Build a website
   - Chat with Eve AI

## Step 6: Post-Deployment Configuration

### Update CORS in Supabase:
1. Go to Supabase Dashboard
2. Navigate to Authentication > URL Configuration
3. Add your domain:
   - Site URL: `https://digimaster.com`
   - Redirect URLs: `https://digimaster.com/**`

### Enable Email Auth:
1. In Supabase Dashboard > Authentication > Providers
2. Enable Email provider
3. Configure email templates (optional)

## How to Use DigiMaster

### For Users:

#### 1. Sign Up
- Go to https://digimaster.com
- Click "Get Started Free"
- Fill in your details
- Start with Free plan (100 contacts, 1 website)

#### 2. Add Contacts
- Navigate to "Contacts" in sidebar
- Click "Add Contact"
- Fill in contact information
- Add tags for organization

#### 3. Create Campaigns
- Navigate to "Campaigns"
- Click "Create Campaign"
- Choose Email or SMS
- Write your message
- Click "Send Now" or schedule for later

#### 4. Build Websites
- Navigate to "Websites"
- Click "Create Website"
- Choose a template:
  - Modern Business
  - Creative Portfolio
  - Minimal Landing
  - Restaurant
- Customize and publish

#### 5. Use Eve AI Assistant
- Navigate to "Eve AI"
- Ask questions like:
  - "Draft an email campaign"
  - "Analyze my contacts"
  - "Create website content"
- Get AI-powered suggestions

#### 6. Upgrade Your Plan
- Navigate to "Settings" > "Billing"
- Choose Pro ($97/mo) or Agency ($297/mo)
- Unlock unlimited features

### For Administrators:

#### Monitor Usage:
```sql
-- Total users
SELECT COUNT(*) FROM users;

-- Users by plan
SELECT plan, COUNT(*) FROM users GROUP BY plan;

-- Active campaigns
SELECT status, COUNT(*) FROM campaigns GROUP BY status;
```

#### Manage Database:
Access Supabase Dashboard to:
- View/edit data
- Monitor queries
- Check logs
- Manage authentication

## Troubleshooting

### Issue: Authentication not working
**Solution**: Check Supabase URL configuration and CORS settings

### Issue: Pages not loading
**Solution**: Verify all environment variables are set in Vercel

### Issue: Database connection errors
**Solution**: Check Supabase project is active and not paused

### Issue: Build failures
**Solution**: Run `npm run build` locally to identify errors

## Environment Variables Reference

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Optional: For production
NODE_ENV=production
```

## Monitoring & Analytics

### Built-in Metrics:
- Dashboard shows real-time stats
- Campaign analytics (opens, clicks)
- Contact growth tracking

### Recommended Tools:
- Vercel Analytics (free with Vercel)
- Supabase Dashboard (built-in monitoring)
- Google Analytics (optional)

## Security Checklist

✅ RLS enabled on all tables
✅ Password hashing with bcrypt
✅ HTTPS enforced
✅ Environment variables secured
✅ CORS properly configured
✅ Auth tokens handled securely

## Backup & Recovery

Supabase provides automatic backups:
- Daily backups retained for 7 days
- Point-in-time recovery available

To download backup:
1. Go to Supabase Dashboard
2. Navigate to Database > Backups
3. Download desired backup

## Support & Resources

- Documentation: This file
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs

## Scaling Considerations

### Free Plan Limits:
- 100 contacts per user
- 1 website per user
- Basic features only

### Pro Plan Features:
- Unlimited contacts
- Unlimited websites
- Custom domains
- Priority support

### Agency Plan Features:
- Everything in Pro
- Team members (up to 10)
- White-label options
- API access
- Dedicated support

## Next Steps After Deployment

1. ✅ Test all features thoroughly
2. ✅ Set up monitoring alerts
3. ✅ Configure backup schedules
4. ✅ Add custom branding
5. ✅ Launch marketing campaigns
6. ✅ Onboard first customers

## Contact

For deployment issues or questions, check:
- Vercel deployment logs
- Supabase logs
- Browser console errors

---

**Congratulations!** DigiMaster is now deployed and ready to help local businesses grow! 🚀
