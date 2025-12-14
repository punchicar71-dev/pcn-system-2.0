#!/bin/sh
export HOSTNAME=0.0.0.0
export PORT=${PORT:-8080}
echo "Starting dashboard on ${HOSTNAME}:${PORT}"
node .next/standalone/dashboard/server.js
