#!/bin/sh
export HOSTNAME=0.0.0.0
export PORT=${PORT:-8080}
echo "Starting web on ${HOSTNAME}:${PORT}"
node .next/standalone/web/server.js
