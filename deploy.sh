#!/bin/bash
# Quick deployment script

echo "🚀 VSLA System Quick Deployment"
echo "================================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed. Install from https://nodejs.org"
    exit 1
fi

# Check Git
if ! command -v git &> /dev/null; then
    echo "❌ Git not installed. Install from https://git-scm.com"
    exit 1
fi

echo "✅ Node.js $(node -v) installed"
echo "✅ Git $(git -v | cut -d' ' -f3) installed"

# Install dependencies
echo ""
echo "📦 Installing backend dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "🚀 NEXT STEPS:"
echo "1. Copy .env.example to .env"
echo "2. Update .env with your database credentials"
echo "3. Create PostgreSQL database: vsl_accountability"
echo "4. Run: npm run dev"
echo ""
echo "📖 Full guide: See COMPLETE_SETUP_GUIDE.md"
