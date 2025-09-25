# MIS Attendance API

A production-ready API service for tracking student attendance data from the MIS portal. Designed for mobile app integration.

## 🚀 Features

- **RESTful API** with multiple endpoints
- **Mobile-optimized responses** for React Native/Flutter apps
- **Automatic data caching** with configurable TTL
- **Production security** with Helmet, CORS, and API keys
- **Health monitoring** and graceful shutdown
- **Auto-refresh** data every 30 minutes
- **Error handling** and logging
- **Heroku-ready** deployment

## 📱 API Endpoints

### Primary Endpoints
- `GET /api/attendance` - Full attendance data with statistics
- `GET /api/mobile/attendance` - Mobile-optimized format
- `GET /api/attendance/subject/:name` - Specific subject data
- `GET /health` - Health check endpoint

### Management
- `POST /api/refresh` - Force data refresh (requires API key)

## 🔧 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev

# Or start production server
npm start
```

### Mobile App Integration

```javascript
// React Native / Flutter HTTP calls
const API_BASE = 'https://your-app.herokuapp.com';

// Get attendance data
const response = await fetch(`${API_BASE}/api/mobile/attendance`);
const data = await response.json();

console.log(data);
// {
//   success: true,
//   student: { rollNumber: "22SW013", name: "Muhammad Yaqoob" },
//   summary: { totalSubjects: 7, averageAttendance: 82, riskSubjects: 1 },
//   subjects: [...]
// }
```

## 🚀 Heroku Deployment

### 1. Create Heroku App
```bash
# Install Heroku CLI first
heroku create your-attendance-api
```

### 2. Configure Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set MIS_CNIC=your-cnic-here
heroku config:set MIS_PASSWORD=your-password-here
heroku config:set API_KEY=your-secret-api-key
```

### 3. Add Puppeteer Buildpack
```bash
heroku buildpacks:add jontewks/puppeteer
heroku buildpacks:add heroku/nodejs
```

### 4. Deploy
```bash
git add .
git commit -m "Initial deployment"
git push heroku main
```

### 5. Verify Deployment
```bash
heroku open/health
```

## 📋 Environment Variables

Create a `.env` file:
```env
MIS_CNIC=your-cnic
MIS_PASSWORD=your-password
API_KEY=your-secret-key
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=*
```

## 🔐 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin protection
- **API Key** - Protected refresh endpoint
- **Input validation** - Safe data handling
- **Error sanitization** - No sensitive data leaks

## 📊 Response Formats

### Full API Response
```json
{
  "success": true,
  "data": {
    "rollNumber": "22SW013",
    "subjects": [...],
    "statistics": {
      "totalSubjects": 7,
      "passedSubjects": 6,
      "averageAttendance": 82
    }
  },
  "meta": {
    "lastUpdated": "2025-09-25T...",
    "cached": true
  }
}
```

### Mobile-Optimized Response
```json
{
  "success": true,
  "student": {
    "rollNumber": "22SW013",
    "name": "Muhammad Yaqoob"
  },
  "summary": {
    "totalSubjects": 7,
    "averageAttendance": 82,
    "riskSubjects": 1
  },
  "subjects": [
    {
      "name": "DSS",
      "attendance": "27/35",
      "percentage": 77,
      "status": "PASS",
      "color": "orange"
    }
  ]
}
```

## 🔄 Data Refresh

- **Automatic**: Every 30 minutes (production only)
- **Manual**: `POST /api/refresh` with API key
- **Cached**: 15-minute cache for performance

## 📱 Mobile App Usage

Perfect for:
- **React Native** apps
- **Flutter** applications
- **Progressive Web Apps**
- **Mobile-first** interfaces

## 🐛 Monitoring

- Health checks at `/health`
- Request logging
- Error tracking
- Uptime monitoring

## 🛠 Development

```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Run scraper manually
npm run scrape

# Start production server
npm start
```

## 📈 Performance

- **Compression** middleware
- **Caching** strategy
- **Optimized** responses
- **Minimal** dependencies

## 🔧 Troubleshooting

### Common Issues
1. **Puppeteer on Heroku**: Make sure buildpack is added
2. **Environment Variables**: Check all required vars are set
3. **MIS Portal Access**: Verify credentials and network access

### Logs
```bash
# View Heroku logs
heroku logs --tail

# Check health
curl https://your-app.herokuapp.com/health
```

## 📞 Support

For issues or questions, check the logs first:
- Application logs show scraping status
- Health endpoint shows system status
- Error responses include helpful messages