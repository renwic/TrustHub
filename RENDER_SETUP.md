# Heartlink Render.com Deployment Guide

## Quick Setup Commands

### 1. Environment Variables for Render
```
NODE_ENV=production
DATABASE_URL=<from_render_postgresql_service>
SESSION_SECRET=<generate_32_char_random_string>
GOOGLE_CLIENT_ID=<from_google_console>
GOOGLE_CLIENT_SECRET=<from_google_console>
FACEBOOK_APP_ID=<from_facebook_developers>
FACEBOOK_APP_SECRET=<from_facebook_developers>
```

### 2. Build Configuration
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18 or higher

### 3. Database Setup (Run in Render Shell)
```bash
npm run db:push
```

### 4. OAuth Setup Required

Since this app uses Replit Auth (which won't work on Render), you need to:

#### Option A: Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect: `https://your-app.onrender.com/auth/google/callback`

#### Option B: Facebook OAuth  
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create new app
3. Add Facebook Login product
4. Add redirect URI: `https://your-app.onrender.com/auth/facebook/callback`

### 5. Post-Deployment Steps
1. Test authentication flow
2. Verify database connections
3. Check all API endpoints
4. Test file uploads (if any)
5. Monitor logs for errors

## Troubleshooting

### Common Issues:
- **Build fails**: Check Node version and dependencies
- **Database connection**: Verify DATABASE_URL format
- **Authentication loops**: Ensure OAuth credentials are correct
- **Static files not serving**: Check build output directory

### Log Access:
- View logs in Render dashboard under your service
- Use `console.log()` for debugging (visible in logs)

## Performance Optimization

### For Production:
1. Enable connection pooling
2. Add Redis for session storage (optional)
3. Configure CDN for static assets
4. Set up monitoring and alerts
5. Consider upgrading to higher tier plans for better performance

## Security Checklist

- ✓ SESSION_SECRET is cryptographically secure
- ✓ DATABASE_URL uses SSL
- ✓ OAuth redirect URIs are HTTPS only
- ✓ No sensitive data in environment variables
- ✓ CORS properly configured
- ✓ Rate limiting enabled (if implemented)