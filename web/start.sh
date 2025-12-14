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
