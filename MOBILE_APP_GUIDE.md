# MIS Attendance Mobile App - Developer Guide

A modern, sleek React Native application for viewing MIS attendance data with smart caching and refresh functionality.

## 📱 App Overview

This mobile app connects to your MIS Attendance API to display real-time attendance data with:
- **Smart Caching**: Automatically caches data for 1 hour
- **Manual Refresh**: Pull-to-refresh and refresh button
- **Modern Design**: Abstract UI with high contrast colors
- **Offline Support**: Shows cached data when offline
- **Loading States**: Beautiful loading animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- React Native CLI or Expo CLI
- Android Studio / Xcode
- Your MIS API running on `http://your-server:3000`

### Setup Instructions

```bash
# 1. Create new React Native project
npx react-native init MISAttendanceApp
cd MISAttendanceApp

# 2. Install required dependencies
npm install @react-native-async-storage/async-storage
npm install react-native-vector-icons
npm install @react-native-community/netinfo
npm install react-native-linear-gradient
npm install react-native-gesture-handler



# 3. iOS setup (if targeting iOS)
cd ios && pod install && cd ..

# 4. Configure vector icons (Android)
# Add to android/app/build.gradle:
# apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

## 🔌 API Documentation

### Base URL
```
http://your-server:3000
```

### Available Endpoints

#### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-25T12:53:32.329Z",
  "uptime": 21.975789125,
  "message": "Server is running and ready to fetch attendance data"
}
```

#### 2. Get Attendance Data
```http
GET /api/attendance
```

**Response (Success):**
```json
{
  "success": true,
  "data": [
    {
      "subjectName": "DSS",
      "conducted": "35",
      "attended": "27",
      "missed": "8",
      "percentage": "77%"
    },
    {
      "subjectName": "DS-A",
      "conducted": "31",
      "attended": "25",
      "missed": "6",
      "percentage": "81%"
    },
    {
      "subjectName": "DS-A Lab",
      "conducted": "27",
      "attended": "24",
      "missed": "3",
      "percentage": "89%"
    },
    {
      "subjectName": "MAD",
      "conducted": "27",
      "attended": "18",
      "missed": "9",
      "percentage": "67%"
    },
    {
      "subjectName": "MAD Lab",
      "conducted": "39",
      "attended": "39",
      "missed": "0",
      "percentage": "100%"
    },
    {
      "subjectName": "TSW",
      "conducted": "20",
      "attended": "16",
      "missed": "4",
      "percentage": "80%"
    },
    {
      "subjectName": "SPM",
      "conducted": "34",
      "attended": "26",
      "missed": "8",
      "percentage": "76%"
    }
  ],
  "timestamp": "2025-09-25T10:30:15.123Z",
  "fresh": true,
  "message": "Data fetched fresh from MIS"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Attendance data not available",
  "message": "Unable to fetch attendance data from MIS. Please try again later.",
  "details": "Connection timeout or MIS server unavailable"
}
```

### Data Structure Explanation

Each subject object contains:
- `subjectName`: Full name of the subject (e.g., "DSS", "DS-A", "MAD Lab")
- `conducted`: Total number of classes conducted (as string)
- `attended`: Number of classes attended (as string)  
- `missed`: Number of classes missed (as string) - **Note: This is provided by API**
- `percentage`: Attendance percentage with % symbol (as string)

### Processing for Mobile App

The mobile app should process this raw data to create enhanced objects:

```javascript
// Example data processing
const processSubjectData = (rawSubject) => ({
  subjectName: rawSubject.subjectName,
  totalClasses: parseInt(rawSubject.conducted),
  classesAttended: parseInt(rawSubject.attended),
  classesMissed: parseInt(rawSubject.missed), // Use API-provided missed count
  attendancePercentage: parseInt(rawSubject.percentage.replace('%', '')),
  rawPercentage: rawSubject.percentage,
  status: getAttendanceStatus(parseInt(rawSubject.percentage.replace('%', ''))),
  statusColor: getStatusColor(parseInt(rawSubject.percentage.replace('%', '')))
});

const getAttendanceStatus = (percentage) => {
  if (percentage >= 90) return 'EXCELLENT';
  if (percentage >= 80) return 'GOOD'; 
  if (percentage >= 70) return 'SAFE';
  return 'AT_RISK';
};

const getStatusColor = (percentage) => {
  if (percentage >= 90) return colors.attendance.excellent; // Green
  if (percentage >= 80) return colors.attendance.good;      // Blue
  if (percentage >= 70) return colors.attendance.warning;   // Amber  
  return colors.attendance.danger;                          // Red
};
```

### API Behavior Notes

1. **Fresh Data**: Each API call runs the scraper and fetches live data from MIS
2. **Response Time**: Expect 5-10 seconds response time per request
3. **Rate Limiting**: Implement proper caching to avoid frequent API calls
4. **Error Handling**: API may fail if MIS server is down or network issues occur
### Processed Data Format (What Your App Will Use)

After processing the raw API data, your app will work with this enhanced format:

```javascript
{
  "success": true,
  "subjects": [
    {
      "subjectName": "DSS",
      "totalClasses": 35,
      "classesAttended": 27,
      "classesMissed": 8,
      "attendancePercentage": 77,
      "rawPercentage": "77%",
      "status": "SAFE",
      "statusColor": "#F59E0B"
    },
    {
      "subjectName": "DS-A",
      "totalClasses": 31,
      "classesAttended": 25,
      "classesMissed": 6,
      "attendancePercentage": 81,
      "rawPercentage": "81%",
      "status": "GOOD",
      "statusColor": "#3B82F6"
    },
    {
      "subjectName": "DS-A Lab",
      "totalClasses": 27,
      "classesAttended": 24,
      "classesMissed": 3,
      "attendancePercentage": 89,
      "rawPercentage": "89%",
      "status": "GOOD",
      "statusColor": "#3B82F6"
    },
    {
      "subjectName": "MAD",
      "totalClasses": 27,
      "classesAttended": 18,
      "classesMissed": 9,
      "attendancePercentage": 67,
      "rawPercentage": "67%",
      "status": "AT_RISK",
      "statusColor": "#EF4444"
    },
    {
      "subjectName": "MAD Lab",
      "totalClasses": 39,
      "classesAttended": 39,
      "classesMissed": 0,
      "attendancePercentage": 100,
      "rawPercentage": "100%",
      "status": "EXCELLENT",
      "statusColor": "#10B981"
    },
    {
      "subjectName": "TSW",
      "totalClasses": 20,
      "classesAttended": 16,
      "classesMissed": 4,
      "attendancePercentage": 80,
      "rawPercentage": "80%",
      "status": "GOOD",
      "statusColor": "#3B82F6"
    },
    {
      "subjectName": "SPM",
      "totalClasses": 34,
      "classesAttended": 26,
      "classesMissed": 8,
      "attendancePercentage": 76,
      "rawPercentage": "76%",
      "status": "SAFE", 
      "statusColor": "#F59E0B"
    }
  ],
  "statistics": {
    "totalSubjects": 7,
    "safeSubjects": 6,
    "riskSubjects": 1,
    "averageAttendance": 82,
    "totalClasses": 233,
    "totalAttended": 175,
    "overallStatus": "SAFE"
  },
  "meta": {
    "lastUpdated": "2025-09-25T10:30:15.123Z",
    "apiTimestamp": "2025-09-25T10:30:15.123Z",
    "fresh": true
  },
  "fromCache": false,
  "offline": false
}
```

### Status Categories

- **EXCELLENT**: 90%+ attendance (Green)
- **GOOD**: 80-89% attendance (Blue) 
- **SAFE**: 70-79% attendance (Amber)
- **AT_RISK**: Below 70% attendance (Red)
```

## 🎨 Design System

### Color Palette
```javascript
const colors = {
  // Primary Colors
  primary: '#6366F1',      // Indigo
  primaryDark: '#4F46E5',  // Darker Indigo
  secondary: '#10B981',     // Emerald
  
  // Status Colors
  success: '#10B981',       // Green
  warning: '#F59E0B',       // Amber
  danger: '#EF4444',        // Red
  
  // Neutral Colors
  background: '#0F172A',    // Dark Blue
  surface: '#1E293B',       // Lighter Dark
  text: '#F8FAFC',          // Almost White
  textSecondary: '#94A3B8', // Gray
  border: '#334155',        // Border Gray
}
```

### Typography
```javascript
const typography = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
}
```

## 🏗️ App Architecture

```
src/
├── components/           # Reusable UI components
│   ├── AttendanceCard.js
│   ├── SubjectItem.js
│   ├── LoadingScreen.js
│   └── RefreshButton.js
├── screens/             # App screens
│   ├── HomeScreen.js
│   └── SubjectDetail.js
├── services/            # API and storage services
│   ├── apiService.js
│   └── cacheService.js
├── utils/               # Utility functions
│   ├── colors.js
│   ├── typography.js
│   └── helpers.js
└── App.js              # Main app component
```

## 🔧 Key Features Implementation

### 1. API Service with Caching

```javascript
// services/apiService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const API_BASE_URL = 'http://your-server:3000'; // Replace with your actual server URL
const CACHE_KEY = 'attendance_data';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

class AttendanceService {
  async getAttendance(forceRefresh = false) {
    try {
      // Check network connectivity
      const networkState = await NetInfo.fetch();
      
      if (!forceRefresh && !networkState.isConnected) {
        return await this.getCachedData();
      }

      // Check cache validity
      if (!forceRefresh) {
        const cachedData = await this.getCachedData();
        if (cachedData && this.isCacheValid(cachedData.timestamp)) {
          return cachedData;
        }
      }

      // Fetch fresh data from API
      const response = await fetch(`${API_BASE_URL}/api/attendance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();
      
      if (rawData.success) {
        // Process the raw data into app-friendly format
        const processedData = this.processAttendanceData(rawData);
        
        // Cache the processed data
        await this.cacheData(processedData);
        return processedData;
      } else {
        throw new Error(rawData.message || 'Failed to fetch attendance data');
      }
    } catch (error) {
      console.error('API Error:', error);
      
      // Return cached data on error if available
      const cachedData = await this.getCachedData();
      if (cachedData) {
        return { 
          ...cachedData, 
          fromCache: true, 
          error: error.message,
          offline: true
        };
      }
      throw error;
    }
  }

  // Process raw API data into app-friendly format
  processAttendanceData(rawData) {
    const subjects = rawData.data.map(subject => ({
      subjectName: subject.subjectName,
      totalClasses: parseInt(subject.conducted) || 0,
      classesAttended: parseInt(subject.attended) || 0,
      classesMissed: parseInt(subject.missed) || 0, // Use API-provided missed count
      attendancePercentage: parseInt(subject.percentage?.replace('%', '') || '0'),
      rawPercentage: subject.percentage,
      status: this.getAttendanceStatus(parseInt(subject.percentage?.replace('%', '') || '0')),
      statusColor: this.getStatusColor(parseInt(subject.percentage?.replace('%', '') || '0'))
    }));

    // Calculate overall statistics
    const totalSubjects = subjects.length;
    const totalClasses = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
    const totalAttended = subjects.reduce((sum, s) => sum + s.classesAttended, 0);
    const averageAttendance = totalSubjects > 0 
      ? Math.round(subjects.reduce((sum, s) => sum + s.attendancePercentage, 0) / totalSubjects)
      : 0;
    const safeSubjects = subjects.filter(s => s.attendancePercentage >= 70).length;
    const riskSubjects = totalSubjects - safeSubjects;

    return {
      success: true,
      subjects,
      statistics: {
        totalSubjects,
        safeSubjects,
        riskSubjects,
        averageAttendance,
        totalClasses,
        totalAttended,
        overallStatus: averageAttendance >= 70 ? 'SAFE' : 'AT_RISK'
      },
      meta: {
        lastUpdated: new Date().toISOString(),
        apiTimestamp: rawData.timestamp,
        fresh: rawData.fresh || true
      }
    };
  }

  getAttendanceStatus(percentage) {
    if (percentage >= 90) return 'EXCELLENT';
    if (percentage >= 80) return 'GOOD';
    if (percentage >= 70) return 'SAFE';
    return 'AT_RISK';
  }

  getStatusColor(percentage) {
    if (percentage >= 90) return '#10B981'; // Excellent - Green
    if (percentage >= 80) return '#3B82F6'; // Good - Blue  
    if (percentage >= 70) return '#F59E0B'; // Safe - Amber
    return '#EF4444'; // At Risk - Red
  }

  async getCachedData() {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  async cacheData(data) {
    try {
      const cacheData = {
        ...data,
        cachedAt: new Date().toISOString()
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  isCacheValid(cachedTimestamp) {
    if (!cachedTimestamp) return false;
    const now = new Date().getTime();
    const cacheTime = new Date(cachedTimestamp).getTime();
    return (now - cacheTime) < CACHE_DURATION;
  }

  async clearCache() {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  // Utility method to check API health
  async checkAPIHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }
}

export default new AttendanceService();
```

### 2. Modern Home Screen

```javascript
// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AttendanceService from '../services/apiService';
import { colors, typography } from '../utils';

export default function HomeScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);

      const result = await AttendanceService.getAttendance(forceRefresh);
      setData(result);
      setLastUpdated(new Date());
      
      if (result.fromCache) {
        Alert.alert('Offline Mode', 'Showing cached data. Pull to refresh when online.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => loadAttendanceData(true);

  if (loading && !data) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>MIS Attendance</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Icon name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Overall"
            value={`${data?.statistics?.averageAttendance || 0}%`}
            status={data?.statistics?.overallStatus}
            icon="assessment"
          />
          <StatCard
            title="Subjects"
            value={`${data?.statistics?.safeSubjects || 0}/${data?.statistics?.totalSubjects || 0}`}
            subtitle="Safe"
            status="info"
            icon="school"
          />
          <StatCard
            title="Classes"
            value={`${data?.statistics?.totalAttended || 0}/${data?.statistics?.totalClasses || 0}`}
            subtitle="Attended"
            status="info"
            icon="event"
          />
        </View>

        {/* Subjects List */}
        <View style={styles.subjectsContainer}>
          <Text style={styles.sectionTitle}>Subjects</Text>
          {data?.subjects?.map((subject, index) => (
            <SubjectCard key={index} subject={subject} />
          ))}
        </View>

        {/* Cache Status */}
        {data?.fromCache && (
          <View style={styles.offlineIndicator}>
            <Icon name="cloud-off" size={16} color={colors.warning} />
            <Text style={styles.offlineText}>Showing cached data</Text>
          </View>
        )}

        {/* Last Updated */}
        <Text style={styles.lastUpdated}>
          Last updated: {lastUpdated?.toLocaleTimeString() || 'Never'}
          {data?.meta?.fresh === false && ' (Cached)'}
        </Text>
      </ScrollView>
    </View>
  );
}

// Component styles and other components...
```

### 3. Component Examples

```javascript
// components/SubjectCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../utils';

export default function SubjectCard({ subject }) {
  const getStatusColor = (percentage) => {
    if (percentage >= 80) return colors.success;
    if (percentage >= 70) return colors.warning;
    return colors.danger;
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.subjectName} numberOfLines={2}>
          {subject.subjectName}
        </Text>
        <View style={[
          styles.percentageBadge,
          { backgroundColor: getStatusColor(subject.attendancePercentage) }
        ]}>
          <Text style={styles.percentage}>
            {subject.attendancePercentage}%
          </Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Present</Text>
          <Text style={styles.statValue}>{subject.classesAttended}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{subject.totalClasses}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Missed</Text>
          <Text style={styles.statValue}>{subject.classesMissed}</Text>
        </View>
      </View>
    </View>
  );
}
```

## 📱 App Flow

1. **App Launch**
   - Show loading screen
   - Check cached data (if < 1 hour old, show immediately)
   - Fetch fresh data in background if needed

2. **Data Display**
   - Overall statistics at top
   - Individual subject cards
   - Clear visual indicators for attendance status

3. **Refresh Options**
   - Pull-to-refresh gesture
   - Manual refresh button in header
   - Automatic refresh every hour (optional)

4. **Offline Handling**
   - Show cached data when offline
   - Display offline indicator
   - Queue refresh for when online

## 🎯 Key Requirements

### Must-Have Features
- [x] 1-hour automatic caching
- [x] Manual refresh button
- [x] Pull-to-refresh
- [x] Modern abstract design
- [x] High contrast colors
- [x] Loading states
- [x] Error handling

### Nice-to-Have Features
- [ ] Push notifications for low attendance
- [ ] Dark/Light theme toggle
- [ ] Subject-wise attendance graphs
- [ ] Export attendance report
- [ ] Biometric authentication

## 🔧 Configuration

### API Configuration
Update `services/apiService.js`:
```javascript
const API_BASE_URL = 'http://your-actual-server:3000'; // Replace with your server URL
```

### Customization
- Colors: Edit `utils/colors.js`
- Typography: Edit `utils/typography.js`
- Cache duration: Modify `CACHE_DURATION` in `apiService.js`

## 📋 Testing Checklist

- [ ] App launches successfully
- [ ] Data loads on first launch
- [ ] Cache works (airplane mode test)
- [ ] Pull-to-refresh works
- [ ] Refresh button works
- [ ] Offline indicator shows
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly

## 🚀 Deployment

### Android
```bash
# Generate signed APK
cd android
./gradlew assembleRelease
```

### iOS
```bash
# Build for iOS
npx react-native run-ios --configuration Release
```

## 🆘 Troubleshooting

### Common Issues

**Network Requests Failing on Android:**
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<application android:usesCleartextTraffic="true" ...>
```

**Icons Not Showing:**
```bash
npx react-native link react-native-vector-icons
```

**Metro Bundler Issues:**
```bash
npx react-native start --reset-cache
```

## 📚 Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [API Integration Guide](https://reactnative.dev/docs/network)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
- [Vector Icons Directory](https://oblador.github.io/react-native-vector-icons/)

## 🤝 Support

For issues related to:
- **API**: Check your MIS server logs
- **App Crashes**: Enable debug mode and check logs
- **Network Issues**: Verify server URL and network connectivity

---

**Happy Coding!** 🚀

Built with ❤️ for MIS Attendance Tracking