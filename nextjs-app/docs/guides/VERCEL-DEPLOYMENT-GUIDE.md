# Vercel Deployment Guide

This guide walks you through deploying the multi-tenant Next.js PageBuilder to Vercel.

## Prerequisites

- [x] Vercel account created
- [x] Next.js app running locally
- [x] Git repository (optional but recommended)

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Prepare for Deployment

Make sure you're in the Next.js app directory:
```bash
cd nextjs-app
```

## Step 3: Deploy to Vercel

Run the deployment command:
```bash
vercel
```

You'll be prompted to:
1. Login to Vercel (if not already logged in)
2. Set up and deploy: `Y`
3. Which scope: Select your account
4. Link to existing project? `N` (create new)
5. Project name: `nextjs-pagebuilder` (or your choice)
6. Directory: `./` (current directory)
7. Override settings? `N`

## Step 4: Configure Environment Variables

After initial deployment, set up environment variables:

```bash
# Set production environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

For each variable, paste the value from your `.env.local` file.

Alternatively, use the Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable with its value

## Step 5: Deploy to Production

```bash
vercel --prod
```

This creates a production deployment with optimizations.

## Step 6: Configure Custom Domain

### In Vercel Dashboard:

1. Go to your project
2. Click "Settings" → "Domains"
3. Add your domain: `app.wondrousdigital.com`
4. Follow DNS instructions provided by Vercel

### For Wildcard Domains:

1. Add `*.wondrousdigital.com` in domains settings
2. This allows all subdomains to route to your app
3. Your middleware will handle routing to correct projects

## Step 7: Update DNS Records

For your domain provider:

### A Record (if using apex domain):
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel's IP)
```

### CNAME Record (recommended):
```
Type: CNAME
Name: @ or subdomain
Value: cname.vercel-dns.com
```

## Step 8: Test Production Deployment

1. **Main App**: https://app.wondrousdigital.com
2. **Project Sites**: 
   - https://veterinary-one.wondrousdigital.com
   - https://dentist-one.wondrousdigital.com

## Environment Variables Reference

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://bpdhbxvsguklkbusqtke.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional
NEXT_PUBLIC_APP_URL=https://app.wondrousdigital.com
```

## Deployment Commands Cheat Sheet

```bash
# Deploy preview
vercel

# Deploy to production
vercel --prod

# List deployments
vercel list

# View logs
vercel logs

# Set environment variable
vercel env add KEY_NAME

# Pull environment variables locally
vercel env pull
```

## Troubleshooting

### Domain Not Working
- Check DNS propagation (can take up to 48 hours)
- Verify domain is added in Vercel dashboard
- Check middleware is routing correctly

### Environment Variables Not Working
- Redeploy after adding variables: `vercel --prod`
- Check variable names match exactly
- Ensure no trailing spaces in values

### Build Errors
- Check `vercel logs` for detailed errors
- Ensure all dependencies are in package.json
- Test build locally: `npm run build`

## Next Steps

After successful deployment:
1. Test all customer domains
2. Monitor performance in Vercel Analytics
3. Set up monitoring alerts
4. Configure deployment webhooks (optional)

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- Custom Domains: https://vercel.com/docs/concepts/projects/domains