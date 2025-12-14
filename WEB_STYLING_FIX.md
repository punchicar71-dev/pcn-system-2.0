# Web UI Styling Fix - December 14, 2024

## Issue
The web application was running but displaying unstyled content due to missing static assets and public files in the standalone build.

## Root Cause
When Next.js builds with `output: 'standalone'` in `next.config.js`, it doesn't automatically copy:
1. The `.next/static` directory (CSS, JS chunks, and other static assets)
2. The `public` directory (images, logos, and other public files)

This caused the web application to serve HTML without any styling or images.

## Solution Implemented

### 1. Updated `start.sh` Script
Modified the startup script to copy static assets and public files to the standalone directory before starting the server:

```bash
#!/bin/sh
export HOSTNAME=0.0.0.0
export PORT=${PORT:-8080}

# Copy static assets and public files if they don't exist
echo "Preparing static assets..."
if [ ! -d ".next/standalone/web/.next/static" ]; then
  echo "Copying .next/static to standalone..."
  cp -r .next/static .next/standalone/web/.next/static
fi

if [ ! -d ".next/standalone/web/public" ]; then
  echo "Copying public directory to standalone..."
  cp -r public .next/standalone/web/public
fi

echo "Starting web on ${HOSTNAME}:${PORT}"
node .next/standalone/web/server.js
```

### 2. Updated Dockerfile
Fixed the Dockerfile to copy static files to the correct location in the standalone structure:

```dockerfile
# Production image section
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./web/.next/static
```

### 3. Added Sharp for Image Optimization
Installed `sharp` package to prevent image optimization errors in production:

```bash
npm install sharp
```

This is now included in the `package.json` dependencies.

## Verification Steps

1. Build the application:
   ```bash
   cd web
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Verify the application loads properly at `http://localhost:8080`
   - All CSS styling should be applied
   - Images and logos should load
   - Navigation and layout should work correctly
   - Footer should be properly styled

## Files Modified

1. `/web/start.sh` - Added static asset copying logic
2. `/web/Dockerfile` - Fixed static files copy path
3. `/web/package.json` - Added sharp dependency

## Deployment Checklist

When deploying to production (Railway, Docker, etc.):

- ✅ Ensure the build includes all static assets
- ✅ The `start.sh` script runs before the server starts
- ✅ Sharp package is installed for image optimization
- ✅ Environment variables are properly set
- ✅ The standalone directory structure is correct:
  ```
  .next/standalone/
  ├── web/
  │   ├── .next/
  │   │   └── static/  (copied from build)
  │   ├── public/      (copied from source)
  │   ├── server.js
  │   └── package.json
  └── node_modules/
  ```

## Testing

After deployment, verify:
1. Homepage loads with proper styling
2. All navigation links work
3. Images display correctly
4. Footer is properly formatted
5. Mobile responsive design works
6. No console errors related to missing assets

## Additional Notes

- The fix is backward compatible with both local development and production builds
- The script only copies files if they don't already exist, preventing unnecessary operations
- Sharp warnings are now resolved with proper image optimization support
- This solution works with Next.js 14.2+ in standalone mode

## Status
✅ **RESOLVED** - Web UI is now displaying correctly with all styles and assets loading properly.
