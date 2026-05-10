# Deployment Guide

## Deploy to Vercel

### Quick Deploy

1. **Go to Vercel:**
   Visit [vercel.com/new](https://vercel.com/new)

2. **Import Repository:**
   - Click "Import Git Repository"
   - Select your GitHub account
   - Choose the `builderpad` repository

3. **Configure Project:**
   - Framework Preset: Vite (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)

4. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
   Get your API key from: https://aistudio.google.com/app/apikey

5. **Deploy:**
   Click "Deploy" and wait for the build to complete

6. **Done!**
   Your app will be live at `https://your-project-name.vercel.app`

### Using Vercel CLI (Alternative)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Add Environment Variables:**
   ```bash
   vercel env add GEMINI_API_KEY
   ```
   Paste your Gemini API key when prompted.

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

## Environment Variables

Make sure to set these in your Vercel dashboard:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

## Automatic Deployments

Once connected, Vercel will automatically:
- Deploy every push to the `master` branch to production
- Create preview deployments for pull requests
- Run builds and checks before deploying

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify environment variables are set correctly
- Check build logs in Vercel dashboard

### API Key Issues
- Ensure `GEMINI_API_KEY` is set in Vercel environment variables
- Verify the API key is valid and has proper permissions
- Check API key hasn't expired

### Runtime Errors
- Check the Vercel function logs
- Verify all environment variables are accessible
- Test the build locally with `npm run build && npm run preview`

## Support

- Vercel Documentation: https://vercel.com/docs
- Gemini API Documentation: https://ai.google.dev/docs
