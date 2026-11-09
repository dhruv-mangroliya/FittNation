# Fitness Tracking API Documentation

## Overview
Production-ready fitness tracking backend with comprehensive workout logging, exercise management, and progress tracking features.

---

## Database Schema Overview

### Models
1. **MuscleGroup** - Muscle groups (Chest, Back, Legs, etc.)
2. **ExerciseGroup** - Workout splits (Push Day, Pull Day, Leg Day)
3. **Exercise** - Individual exercises
4. **Workout** - Daily workout logs with embedded exercises and sets
5. **PersonalRecord** - Tracks max weight/volume per exercise (auto-updated)

---

## API Endpoints

### 📅 WORKOUTS

#### 1. Create Workout / Add Exercise
```http
POST /api/workouts
Content-Type: application/json
Authorization: Bearer {token}

{
  "exerciseId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "exerciseName": "Bench Press",
  "sets": [
    {
      "reps": 10,
      "weight": 100,
      "notes": "Good form"
    },
    {
      "reps": 8,
      "weight": 110,
      "notes": "Last set was harder"
    }
  ],
  "date": "2024-05-02"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "user_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "date": "2024-05-02T00:00:00Z",
    "exercises": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
        "exercise_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "name": "Bench Press",
        "sets": [
          {
            "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
            "reps": 10,
            "weight": 100,
            "duration": null,
            "volume": 1000,
            "notes": "Good form"
          },
          {
            "_id": "65f1a2b3c4d5e6f7g8h9i0j4",
            "reps": 8,
            "weight": 110,
            "duration": null,
            "volume": 880,
            "notes": "Last set was harder"
          }
        ]
      }
    ],
    "totalDuration": 0,
    "notes": "",
    "createdAt": "2024-05-02T10:30:00Z",
    "updatedAt": "2024-05-02T10:30:00Z"
  },
  "message": "Exercise added to workout"
}
```

---

#### 2. Get Today's Workout
```http
GET /api/workouts/today
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "user_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "date": "2024-05-02T00:00:00Z",
    "exercises": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
        "exercise_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "name": "Bench Press",
        "sets": [
          {
            "reps": 10,
            "weight": 100,
            "volume": 1000,
            "notes": "Good form"
          }
        ]
      }
    ],
    "createdAt": "2024-05-02T10:30:00Z"
  },
  "message": "Today's workout fetched"
}
```

---

#### 3. Get All Workouts (Paginated)
```http
GET /api/workouts?page=1&limit=10
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "user_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "date": "2024-05-02T00:00:00Z",
        "exercises": []
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  },
  "message": "Workouts fetched"
}
```

---

#### 4. Get Calendar (Workout Dates)
```http
GET /api/workouts/calendar?startDate=2024-05-01&endDate=2024-05-31
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    "2024-05-01",
    "2024-05-02",
    "2024-05-04",
    "2024-05-06",
    "2024-05-08",
    "2024-05-09",
    "2024-05-11"
  ],
  "message": "Calendar data fetched"
}
```

---

#### 5. Get Workout Statistics
```http
GET /api/workouts/stats?startDate=2024-01-01&endDate=2024-05-02
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_workouts": 45,
    "total_exercises": 132,
    "total_sets": 312,
    "total_volume": 45620
  },
  "message": "Statistics fetched"
}
```

---

### 💪 EXERCISES

#### 1. Get All Exercises
```http
GET /api/exercises?page=1&limit=20&group_id=65f1a2b3c4d5e6f7g8h9i0j1
Content-Type: application/json
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "name": "Bench Press",
        "group_id": {
          "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
          "name": "Push Day"
        },
        "muscle_group_ids": [
          {
            "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
            "name": "Chest"
          }
        ],
        "unit": "kg",
        "description": "Barbell chest press",
        "createdAt": "2024-05-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  },
  "message": "Exercises fetched"
}
```

---

#### 2. Get Exercise Growth Data (For Graphing)
```http
GET /api/exercises/65f1a2b3c4d5e6f7g8h9i0j1/growth
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-04-15T00:00:00Z",
      "max_weight": 90,
      "total_volume": 3600,
      "max_reps": 12,
      "sets_count": 3
    },
    {
      "date": "2024-04-20T00:00:00Z",
      "max_weight": 95,
      "total_volume": 3800,
      "max_reps": 12,
      "sets_count": 3
    },
    {
      "date": "2024-04-25T00:00:00Z",
      "max_weight": 100,
      "total_volume": 4000,
      "max_reps": 10,
      "sets_count": 3
    },
    {
      "date": "2024-05-02T00:00:00Z",
      "max_weight": 110,
      "total_volume": 1880,
      "max_reps": 10,
      "sets_count": 2
    }
  ],
  "message": "Growth data fetched"
}
```

**Use this for line charts showing progression over time**

---

#### 3. Get Last 5 Records of Exercise
```http
GET /api/exercises/65f1a2b3c4d5e6f7g8h9i0j1/last-records?limit=5
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-05-02T00:00:00Z",
      "exercise_name": "Bench Press",
      "sets": [
        {
          "reps": 10,
          "weight": 100,
          "volume": 1000,
          "notes": "Good form"
        },
        {
          "reps": 8,
          "weight": 110,
          "volume": 880,
          "notes": "Last set was harder"
        }
      ]
    },
    {
      "date": "2024-04-30T00:00:00Z",
      "exercise_name": "Bench Press",
      "sets": [
        {
          "reps": 12,
          "weight": 95,
          "volume": 1140,
          "notes": "Felt strong"
        }
      ]
    },
    {
      "date": "2024-04-25T00:00:00Z",
      "exercise_name": "Bench Press",
      "sets": [
        {
          "reps": 10,
          "weight": 100,
          "volume": 1000,
          "notes": ""
        },
        {
          "reps": 8,
          "weight": 100,
          "volume": 800,
          "notes": ""
        }
      ]
    }
  ],
  "message": "Last records fetched"
}
```

---

#### 4. Get Paginated Exercise History
```http
GET /api/exercises/65f1a2b3c4d5e6f7g8h9i0j1/history?page=1&limit=10
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "date": "2024-05-02T00:00:00Z",
        "exercise_name": "Bench Press",
        "sets": [
          {
            "reps": 10,
            "weight": 100,
            "volume": 1000
          }
        ]
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  },
  "message": "Exercise history fetched"
}
```

---

### 🏋️ MUSCLE GROUPS

#### 1. Get All Muscle Groups
```http
GET /api/muscle-groups
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Chest",
      "description": "Pectoral muscles",
      "createdAt": "2024-05-01T10:00:00Z"
    },
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Back",
      "description": "Latissimus and back muscles",
      "createdAt": "2024-05-01T10:00:00Z"
    }
  ],
  "message": "Muscle groups fetched"
}
```

---

### 📋 EXERCISE GROUPS

#### 1. Get All Exercise Groups
```http
GET /api/exercise-groups
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Push Day",
      "description": "Chest, shoulders, and triceps",
      "muscle_group_ids": [
        {
          "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
          "name": "Chest"
        },
        {
          "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
          "name": "Shoulders"
        },
        {
          "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
          "name": "Triceps"
        }
      ],
      "createdAt": "2024-05-01T10:00:00Z"
    },
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Pull Day",
      "description": "Back and biceps",
      "muscle_group_ids": [
        {
          "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
          "name": "Back"
        },
        {
          "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
          "name": "Biceps"
        }
      ],
      "createdAt": "2024-05-01T10:00:00Z"
    }
  ],
  "message": "Exercise groups fetched"
}
```

---

## 🔑 Authentication

All endpoints marked with 🔒 require authentication via the existing session/passport setup.

The middleware checks:
```javascript
if (!req.user) {
  return res.status(401).json({ success: false, message: 'Not authenticated' });
}
```

---

## 📊 Data Structures

### Workout Document
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  date: Date,  // Only date part (00:00:00)
  exercises: [
    {
      exercise_id: ObjectId,
      name: String,
      sets: [
        {
          reps: Number,
          weight: Number,
          duration: Number,
          volume: Number,  // Auto-calculated: weight * reps
          notes: String
        }
      ]
    }
  ],
  totalDuration: Number,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Personal Record Document
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  exercise_id: ObjectId,
  exercise_name: String,
  max_weight: Number,
  max_reps: Number,
  max_duration: Number,
  max_volume: Number,
  last_updated: Date,
  createdAt: Date
}
```

---

## 🚀 Performance Features

### Indexes
- `Workout.user_id, date DESC` - Fast user workout retrieval
- `Workout.user_id, exercises.exercise_id` - Fast exercise lookups
- `Exercise.group_id` - Fast group filtering
- `PersonalRecord.user_id, exercise_id` - Unique constraint + fast lookup

### Aggregation Pipeline
Growth data uses MongoDB aggregation:
1. Match user workouts
2. Unwind exercises array
3. Match specific exercise
4. Unwind sets array
5. Group by date
6. Calculate max_weight, total_volume
7. Sort by date ascending

This is **much faster** than fetching all data and processing in Node.

---

## 🌱 Database Seeding

Run once to populate initial data:
```bash
npm run seed
```

This creates:
- 9 Muscle Groups (Chest, Back, Shoulders, etc.)
- 4 Exercise Groups (Push Day, Pull Day, Leg Day, Core & Cardio)
- 15 Exercises with proper relationships

---

## 📝 Sample Requests (cURL)

### Create Workout
```bash
curl -X POST http://localhost:5001/api/workouts \
  -H "Content-Type: application/json" \
  -d '{
    "exerciseId": "65f1a2b3c4d5e6f7g8h9i0j1",
    "exerciseName": "Bench Press",
    "sets": [
      {"reps": 10, "weight": 100, "notes": "Good form"},
      {"reps": 8, "weight": 110, "notes": "Harder"}
    ]
  }'
```

### Get Growth Data
```bash
curl http://localhost:5001/api/exercises/65f1a2b3c4d5e6f7g8h9i0j1/growth
```

### Get Calendar
```bash
curl "http://localhost:5001/api/workouts/calendar?startDate=2024-05-01&endDate=2024-05-31"
```

---

## ⚙️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "data": null,
  "message": "Invalid exercise data"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "data": null,
  "message": "Not authenticated"
}
```

### 404 Not Found
```json
{
  "success": false,
  "data": null,
  "message": "Exercise not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "data": null,
  "message": "Server error: [error details]"
}
```

---

## 📱 Frontend Integration Examples

### Fetch Today's Workout
```javascript
const response = await fetch('/api/workouts/today', {
  headers: { 'Content-Type': 'application/json' }
});
const { data } = await response.json();
```

### Add Exercise to Workout
```javascript
const response = await fetch('/api/workouts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    exerciseId: '65f1a2b3c4d5e6f7g8h9i0j1',
    exerciseName: 'Bench Press',
    sets: [
      { reps: 10, weight: 100, notes: 'Good' }
    ]
  })
});
const { data } = await response.json();
```

### Fetch Growth Data for Chart
```javascript
const response = await fetch(`/api/exercises/${exerciseId}/growth`);
const { data } = await response.json();
// data = [{ date, max_weight, total_volume }, ...]
// Perfect for Chart.js or Recharts
```

---

## 🔄 Workflow Example

1. **User logs in** → Authenticated via Passport
2. **User selects exercise from list** → GET /api/exercises
3. **User performs sets** → POST /api/workouts (multiple calls, appends to same day)
4. **User checks today's workout** → GET /api/workouts/today
5. **User views progress** → GET /api/exercises/:id/growth (for chart)
6. **User checks calendar** → GET /api/workouts/calendar (highlights workout days)
7. **Personal Records auto-update** → Service layer handles this
8. **User views exercise history** → GET /api/exercises/:id/history?page=1

---

## 🎯 Features Implemented

✅ Exercise Groups (Push Day, Pull Day, Leg Day)  
✅ Exercises inside groups with muscle group mapping  
✅ User workout logging with sets, reps, weight  
✅ Exercise-wise growth tracking with aggregation  
✅ Last 5 records per exercise  
✅ Paginated exercise history  
✅ Today's workout tab  
✅ Calendar marking (dates with workouts)  
✅ Personal Records auto-update  
✅ Volume calculation (weight × reps)  
✅ Production-ready error handling  
✅ Performance indexes  
✅ Modular code structure  

---

## 📦 Dependencies Used

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variables
- (All already in your package.json)

No additional packages needed!

---

## 🔒 Security Notes

- All user-specific endpoints check `req.user` authentication
- Personal records are user-scoped via `user_id`
- Timestamps are immutable post-creation
- MongoDB ObjectId prevents injection attacks
