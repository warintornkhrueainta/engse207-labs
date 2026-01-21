#!/bin/bash
# scripts/start-all.sh
# Start all N-Tier services

echo "═══════════════════════════════════════════════════════"
echo "  🚀 Starting N-Tier Task Board Services"
echo "═══════════════════════════════════════════════════════"

# Start PostgreSQL
echo "1. Starting PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl status postgresql --no-pager | head -3

# Start Nginx
echo ""
echo "2. Starting Nginx..."
sudo systemctl start nginx
sudo systemctl status nginx --no-pager | head -3

# Start Node.js with PM2
echo ""
echo "3. Starting Node.js Backend..."
cd ~/engse207-labs/week6-ntier
pm2 start server.js --name "taskboard-api" --watch
pm2 status

# Verify all services
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅ All services started!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  📍 Access URLs:"
echo "     - HTTPS: https://taskboard.local"
echo "     - API:   https://taskboard.local/api/health"
echo "     - Direct: http://localhost:3000/api/health"
echo ""
echo "  📊 Monitoring:"
echo "     - pm2 logs"
echo "     - sudo tail -f /var/log/nginx/taskboard_access.log"
echo ""