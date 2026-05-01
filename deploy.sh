#!/bin/bash
# Run this on the VPS after pulling new code
# Usage: bash deploy.sh

set -e

echo "==> Pulling latest code..."
git pull origin main

echo "==> Installing dependencies..."
npm ci --omit=dev

echo "==> Building Next.js..."
npm run build

echo "==> Restarting app..."
pm2 restart lms-internal || pm2 start ecosystem.config.js --env production

echo "==> Done! App is running."
pm2 status
