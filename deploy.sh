#!/bin/bash

# Heroku Deployment Script for MIS Attendance API

echo "🚀 Starting Heroku deployment for MIS Attendance API..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "🔑 Please log in to Heroku first:"
    echo "   heroku login"
    exit 1
fi

# Get app name from user
read -p "Enter your Heroku app name (or press Enter for 'mis-attendance-api'): " APP_NAME
APP_NAME=${APP_NAME:-mis-attendance-api}

echo "📱 Creating Heroku app: $APP_NAME"

# Create Heroku app
heroku create $APP_NAME

# Add buildpacks
echo "🔧 Adding buildpacks..."
heroku buildpacks:add jontewks/puppeteer --app $APP_NAME
heroku buildpacks:add heroku/nodejs --app $APP_NAME

# Set environment variables
echo "🔐 Setting environment variables..."
read -p "Enter your MIS CNIC: " MIS_CNIC
read -s -p "Enter your MIS Password: " MIS_PASSWORD
echo ""
read -p "Enter API Key for refresh endpoint: " API_KEY

heroku config:set NODE_ENV=production --app $APP_NAME
heroku config:set MIS_CNIC="$MIS_CNIC" --app $APP_NAME
heroku config:set MIS_PASSWORD="$MIS_PASSWORD" --app $APP_NAME
heroku config:set API_KEY="$API_KEY" --app $APP_NAME
heroku config:set ALLOWED_ORIGINS="*" --app $APP_NAME

# Initialize git if not already
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit"
fi

# Add Heroku remote
heroku git:remote -a $APP_NAME

# Deploy to Heroku
echo "🚀 Deploying to Heroku..."
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Open the app
echo "✅ Deployment complete!"
echo "🌐 Opening your app..."
heroku open --app $APP_NAME

echo "📋 Your API endpoints:"
echo "   Health: https://$APP_NAME.herokuapp.com/health"
echo "   Full API: https://$APP_NAME.herokuapp.com/api/attendance"
echo "   Mobile API: https://$APP_NAME.herokuapp.com/api/mobile/attendance"
echo "   Refresh: https://$APP_NAME.herokuapp.com/api/refresh (POST with API key)"

echo "🎉 Deployment successful! Your MIS Attendance API is now live!"