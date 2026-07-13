#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building client..."
cd client
npm install
npm run build
cd ..

echo "Running database migrations..."
node -e "const pool = require('./api/config/database.js').default; pool.query(require('fs').readFileSync('./api/config/database-schema.sql', 'utf8'));"

echo "Build complete!"
