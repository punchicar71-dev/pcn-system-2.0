#!/bin/sh
export HOSTNAME=0.0.0.0
export PORT=${PORT:-8080}

# Copy static assets and public files if they don't exist
echo "Preparing static assets..."
if [ ! -d ".next/standalone/dashboard/.next/static" ]; then
  echo "Copying .next/static to standalone..."
  cp -r .next/static .next/standalone/dashboard/.next/static
fi

if [ ! -d ".next/standalone/dashboard/public" ]; then
  echo "Copying public directory to standalone..."
  cp -r public .next/standalone/dashboard/public
fi

echo "Starting dashboard on ${HOSTNAME}:${PORT}"
node .next/standalone/dashboard/server.js
