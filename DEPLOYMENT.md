# VSLA Accountability System - Deployment Guide

## 🐳 Docker Deployment

### Create Dockerfile for Backend

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY api ./api
COPY .env.example .env

EXPOSE 5000

CMD ["node", "api/server.js"]
```

### Create Dockerfile for Frontend

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: vsl_accountability
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: vsl_accountability
      DB_USER: postgres
      DB_PASSWORD: secure_password
      JWT_SECRET: your_jwt_secret
      NODE_ENV: production
    ports:
      - "5000:5000"
    depends_on:
      - postgres

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Deploy with Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## ☁️ Heroku Deployment

### Backend on Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-vsla-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET="your_secret_key"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Procfile

```
web: node api/server.js
```

### Frontend on Heroku

```bash
# Create app
heroku create your-vsla-client

# Set buildpack
heroku buildpacks:set heroku/nodejs

# Update package.json scripts
# "build": "cd client && npm run build"
# "start": "cd client && npm start"

# Deploy
git push heroku main
```

---

## 🚀 AWS Deployment

### EC2 Deployment

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance.compute.amazonaws.com

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PostgreSQL
sudo amazon-linux-extras install postgresql12 -y

# Clone repository
git clone https://github.com/charlesayesiga54-svg/-vsl-accountability-hub.git
cd -vsl-accountability-hub

# Install dependencies
npm install
cd client && npm install && npm run build && cd ..

# Create .env
cp .env.example .env
# Edit .env with production values

# Start with PM2
sudo npm install -g pm2
pm2 start api/server.js --name "vsla-api"
pm2 startup
pm2 save
```

### RDS Database

```bash
# Create RDS PostgreSQL instance in AWS Console
# Update .env with RDS endpoint

DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=vsl_accountability
DB_USER=postgres
DB_PASSWORD=your_secure_password
```

### Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli --upgrade --user

# Initialize
eb init -p node.js-18 vsla-app

# Create environment
eb create vsla-prod

# Deploy
eb deploy

# Monitor
eb logs
eb health
```

---

## 🌐 Vercel Deployment (Frontend)

### Deploy React Frontend

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd client
vercel

# Production
vercel --prod
```

### vercel.json Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@vsla_api_url"
  }
}
```

---

## 📊 Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Use strong database password
- [ ] Enable HTTPS
- [ ] Setup automated backups
- [ ] Configure monitoring & alerts
- [ ] Setup error logging (Sentry)
- [ ] Enable rate limiting
- [ ] Configure firewall rules
- [ ] Setup CI/CD pipeline
- [ ] Document deployment process

---

## 🔒 Security Hardening

### Environment Variables
```bash
# Never commit .env files
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

### Database
```sql
-- Create limited user (not admin)
CREATE USER vsla_user WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE vsl_accountability TO vsla_user;
GRANT USAGE ON SCHEMA public TO vsla_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vsla_user;
```

### API Rate Limiting
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📈 Monitoring & Logging

### Sentry Error Tracking

```bash
npm install @sentry/node
```

```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Log Management

```bash
# Using Winston
npm install winston
```

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### .github/workflows/deploy.yml

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name"
          heroku_email: "your@email.com"
```

---

## 📱 Mobile App Deployment

The API works with mobile apps (iOS/Android):

```javascript
// Mobile client setup
const API_BASE_URL = 'https://your-domain.com/api';

// Authentication
const token = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
```

---

## 🆘 Troubleshooting Deployment

### Cold Start Issues
- Use connection pooling
- Optimize bundle size
- Implement lazy loading

### Database Connection Timeouts
- Increase connection pool size
- Configure connection timeout
- Use read replicas for reporting

### Memory Issues
- Monitor Node.js heap usage
- Implement garbage collection
- Use clustering for load distribution

---

## 📞 Support & Maintenance

- Monitor server logs regularly
- Schedule database backups
- Update dependencies monthly
- Review security patches
- Monitor performance metrics

---

**Deployment Complete! 🎉**
