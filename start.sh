# Start command for production
start: node api/server.js

# Or with PM2
start: pm2 start api/server.js --name vsla-api
