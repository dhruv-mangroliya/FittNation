# 🏋️ Fitness Tracking System - Backend

A production-ready fitness tracking backend built with Node.js, Express, and MongoDB. Includes comprehensive workout logging, exercise management, progress tracking, and personal records.

## ✨ Features

- ✅ **Exercise Management** - Organize exercises into groups (Push Day, Pull Day, Leg Day, etc.)
- ✅ **Muscle Groups** - Exercises mapped to specific muscle groups
- ✅ **Workout Logging** - Log sets, reps, weight, and duration with automatic volume calculation
- ✅ **Progress Tracking** - Growth data with max weights and total volumes per day
- ✅ **Last 5 Records** - Quick view of latest exercise performances
- ✅ **Paginated History** - Full exercise history with pagination
- ✅ **Today's Workout** - Real-time view of current day's exercises
- ✅ **Workout Calendar** - Mark dates with at least one completed workout
- ✅ **Personal Records** - Auto-updated max weights and volumes
- ✅ **Statistics** - Aggregate stats (total workouts, exercises, sets, volume)
- ✅ **MongoDB Aggregation** - Efficient data fetching with complex queries
- ✅ **Error Handling** - Consistent error responses with meaningful messages

## 🏗️ Architecture

```
backend/
├── models/
│   ├── MuscleGroup.js          # Muscle groups (Chest, Back, Legs)
│   ├── ExerciseGroup.js        # Workout splits (Push Day, Pull Day)
│   ├── Exercise.js             # Individual exercises
│   ├── Workout.js              # Daily workout logs (embedded structure)
│   └── PersonalRecord.js       # Auto-updated personal records
│
├── controllers/
│   ├── workoutController.js    # Workout CRUD + Calendar/Stats
│   ├── exerciseController.js   # Exercise CRUD + Growth/History
│   └── exerciseGroupController.js  # Muscle & Exercise Groups
│
├── services/
│   └── workoutService.js       # Business logic + Aggregation queries
│
├── routes/
│   ├── workouts.js             # Workout endpoints
│   ├── exercises.js            # Exercise endpoints
│   └── exerciseGroups.js       # Muscle & Exercise Group endpoints
│
├── middleware/
│   └── validation.js           # Input validation utilities
│
├── seed.js                     # Database seeding script
├── FITNESS_API_DOCS.md         # Detailed API documentation
└── README.md                   # This file
```

## 🗄️ Database Schema

### MuscleGroup
```javascript
{
  name: String (unique),        // e.g., "Chest", "Back"
  description: String,
  createdAt: Date
}
```

### ExerciseGroup
```javascript
{
  name: String (unique),        // e.g., "Push Day"
  description: String,
  muscle_group_ids: [ObjectId], // References to MuscleGroups
  createdAt: Date
}
```

### Exercise
```javascript
{
  name: String,
  group_id: ObjectId,           // Reference to ExerciseGroup
  muscle_group_ids: [ObjectId], // Array of MuscleGroup references
  unit: String,                 // "kg", "reps", "seconds", "miles", "km"
  description: String,
  createdAt: Date
}
```

### Workout (Embedded Structure)
```javascript
{
  user_id: ObjectId,
  date: Date,                   // Only date part (00:00:00)
  exercises: [
    {
      exercise_id: ObjectId,
      name: String,
      sets: [
        {
          reps: Number,
          weight: Number,
          duration: Number,
          volume: Number,       // Pre-computed: weight × reps
          notes: String
        }
      ],
      notes: String
    }
  ],
  totalDuration: Number,        // Minutes
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### PersonalRecord
```javascript
{
  user_id: ObjectId,
  exercise_id: ObjectId,
  exercise_name: String,
  max_weight: Number,
  max_reps: Number,
  max_duration: Number,
  max_volume: Number,           // Max weight × reps combination
  last_updated: Date,
  createdAt: Date
}
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/fittnation
PORT=5001
```

### 3. Seed Database
```bash
npm run seed
```

This creates:
- 9 Muscle Groups
- 4 Exercise Groups
- 15 Exercises with proper relationships

### 4. Start Server
```bash
npm start        # Production
npm run dev      # Development (requires nodemon)
```

## 📡 API Endpoints

### Workouts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workouts` | Create/append workout |
| GET | `/api/workouts/today` | Get today's workout |
| GET | `/api/workouts` | Get all workouts (paginated) |
| GET | `/api/workouts/:id` | Get specific workout |
| GET | `/api/workouts/calendar` | Get workout dates (calendar) |
| GET | `/api/workouts/stats` | Get statistics |
| DELETE | `/api/workouts/:id` | Delete workout |

### Exercises
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/exercises` | Create exercise |
| GET | `/api/exercises` | Get all exercises |
| GET | `/api/exercises/:id` | Get specific exercise |
| GET | `/api/exercises/:id/growth` | Get growth data (graphing) |
| GET | `/api/exercises/:id/last-records` | Get last 5 records |
| GET | `/api/exercises/:id/history` | Get paginated history |
| PUT | `/api/exercises/:id` | Update exercise |
| DELETE | `/api/exercises/:id` | Delete exercise |

### Muscle Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/muscle-groups` | Create muscle group |
| GET | `/api/muscle-groups` | Get all muscle groups |
| GET | `/api/muscle-groups/:id` | Get specific muscle group |

### Exercise Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/exercise-groups` | Create exercise group |
| GET | `/api/exercise-groups` | Get all exercise groups |
| GET | `/api/exercise-groups/:id` | Get specific exercise group |
| PUT | `/api/exercise-groups/:id` | Update exercise group |
| DELETE | `/api/exercise-groups/:id` | Delete exercise group |

## 📝 Usage Examples

### Log a Workout
```javascript
const response = await fetch('/api/workouts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    exerciseId: '65f1a2b3c4d5e6f7g8h9i0j1',
    exerciseName: 'Bench Press',
    sets: [
      { reps: 10, weight: 100, notes: 'Good form' },
      { reps: 8, weight: 110, notes: 'Last set was harder' }
    ],
    date: '2024-05-02'
  })
});
const { data, success } = await response.json();
```

### Get Growth Data for Chart
```javascript
const response = await fetch(`/api/exercises/${exerciseId}/growth`);
const { data } = await response.json();
// data = [
//   { date: "2024-04-15", max_weight: 90, total_volume: 3600 },
//   { date: "2024-04-20", max_weight: 95, total_volume: 3800 },
//   { date: "2024-04-25", max_weight: 100, total_volume: 4000 }
// ]
```

### Get Workout Calendar
```javascript
const response = await fetch(
  '/api/workouts/calendar?startDate=2024-05-01&endDate=2024-05-31'
);
const { data } = await response.json();
// data = ["2024-05-01", "2024-05-02", "2024-05-04", ...]
```

### Get Last 5 Records
```javascript
const response = await fetch(
  `/api/exercises/${exerciseId}/last-records?limit=5`
);
const { data } = await response.json();
// Shows your last 5 workout sessions for this exercise
```

### Get Statistics
```javascript
const response = await fetch(
  '/api/workouts/stats?startDate=2024-01-01&endDate=2024-05-02'
);
const { data } = await response.json();
// data = {
//   total_workouts: 45,
//   total_exercises: 132,
//   total_sets: 312,
//   total_volume: 45620
// }
```

## 🔑 Authentication

All user-specific endpoints require authentication via the existing session/Passport setup:

```javascript
// Middleware in routes
const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }
  next();
};
```

## ⚡ Performance Optimizations

### Database Indexes
```javascript
// Workout model
workoutSchema.index({ user_id: 1, date: -1 });
workoutSchema.index({ user_id: 1, 'exercises.exercise_id': 1 });

// Exercise model
exerciseSchema.index({ group_id: 1 });
exerciseSchema.index({ name: 1 });

// PersonalRecord model
personalRecordSchema.index({ user_id: 1, exercise_id: 1 }, { unique: true });
```

### Aggregation Pipeline
Growth data uses MongoDB aggregation for efficient data fetching:
```javascript
// Instead of loading all workouts and processing in Node,
// MongoDB does the heavy lifting:
await Workout.aggregate([
  { $match: { user_id } },
  { $unwind: '$exercises' },
  { $match: { 'exercises.exercise_id': exerciseId } },
  { $unwind: '$exercises.sets' },
  { $group: { _id: '$date', max_weight: { $max: '...' } } },
  { $sort: { _id: 1 } }
]);
```

This is **dramatically faster** than fetching 100+ documents and processing in JavaScript.

## 🔄 Workflow Example

1. User logs in (authenticated via Passport)
2. Fetch available exercises: `GET /api/exercises`
3. User starts workout, adds exercise: `POST /api/workouts`
4. User adds more exercises: `POST /api/workouts` (appends to same day)
5. View today's workout: `GET /api/workouts/today`
6. View exercise progress: `GET /api/exercises/:id/growth` (for chart)
7. Check workout calendar: `GET /api/workouts/calendar`
8. View personal records: Auto-updated in DB
9. View exercise history: `GET /api/exercises/:id/history?page=1`

## 📊 Response Format

All API responses follow a consistent format:

**Success:**
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "success": false,
  "data": null,
  "message": "Error description"
}
```

## 🧪 Testing with cURL

### Create Workout
```bash
curl -X POST http://localhost:5001/api/workouts \
  -H "Content-Type: application/json" \
  -d '{
    "exerciseId": "65f1a2b3c4d5e6f7g8h9i0j1",
    "exerciseName": "Bench Press",
    "sets": [
      {"reps": 10, "weight": 100},
      {"reps": 8, "weight": 110}
    ]
  }'
```

### Get All Exercises
```bash
curl http://localhost:5001/api/exercises
```

### Get Growth Data
```bash
curl http://localhost:5001/api/exercises/65f1a2b3c4d5e6f7g8h9i0j1/growth
```

## 🐛 Common Issues

### Personal Records Not Updating
- Check that `user_id` is being passed to `updatePersonalRecords()`
- Verify the exercise exists in the Exercise collection

### Growth Data Returns Empty
- Ensure workouts exist for the user and exercise
- Check that dates are in ISO format

### Aggregation Errors
- MongoDB aggregation is strict about ObjectId format
- Use `mongoose.Types.ObjectId()` for conversions

## 📚 Full API Documentation

See [FITNESS_API_DOCS.md](./FITNESS_API_DOCS.md) for:
- Detailed endpoint specifications
- Sample requests and responses
- Error handling examples
- Frontend integration patterns

## 🔒 Security Considerations

- ✅ User-scoped data via `user_id` in all queries
- ✅ Authentication checks on sensitive endpoints
- ✅ Input validation on all requests
- ✅ MongoDB injection prevention (ObjectId validation)
- ✅ Timestamps immutable post-creation

## 🚀 Future Enhancements

- [ ] Exercise templates (saved workouts)
- [ ] Workout plans/programs
- [ ] Social features (share workouts)
- [ ] Mobile app integration
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Export to CSV/PDF

## 📞 Support

For detailed API documentation, see `FITNESS_API_DOCS.md`

---

**Built with ❤️ using Express + MongoDB**
