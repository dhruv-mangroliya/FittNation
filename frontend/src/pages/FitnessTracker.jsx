import { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Label } from 'recharts';
import { useAuth } from '../context/AuthContext';
import TrackerNavbar from '../components/TrackerNavbar';
import './FitnessTracker.css';
import ShareStudio from '../share/ShareStudio';

const API = import.meta.env.VITE_API_BASE_URL;

// Recharts theme for the dark dashboard
const CHART = {
  line: '#E3271B',
  grid: 'rgba(255,255,255,0.07)',
  tick: { fontSize: 11, fill: 'rgba(244,244,242,0.5)', fontFamily: 'Inter' },
  label: { fontSize: 10, fill: 'rgba(244,244,242,0.45)', fontFamily: 'Inter' },
  tooltip: {
    background: 'rgba(21,21,24,0.96)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 12,
    fontFamily: 'Inter',
    fontSize: 12,
    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
  },
};

const NUTRITION_COURSES = {
  loss: {
    label: 'Weight Loss',
    subtitle: 'Science-backed strategies to lose fat while preserving muscle.',
    videos: [
      { title: 'How Fat Loss Actually Works',       thumb: '/Courses/WL_Video1.png', url: 'https://www.youtube.com/watch?v=GqlCl4czZZg' },
      { title: 'How Many Calories YOU Need',        thumb: '/Courses/WL_Video2.png', url: 'https://www.youtube.com/watch?v=dYuIHgwNFJQ' },
      { title: 'High Protein Diet for Fat Loss',    thumb: '/Courses/WL_Video3.png', url: 'https://www.youtube.com/watch?v=sLjpuf_uW48' },
      { title: 'Cardio vs Weight Training',         thumb: '/Courses/WL_Video4.png', url: 'https://www.youtube.com/watch?v=qGg9oOztkZM' },
      { title: 'Mistakes That Stop Fat Loss',       thumb: '/Courses/WL_Video5.png', url: 'https://www.youtube.com/watch?v=wyUENWlkDgg' },
      { title: 'Sleep & Stress Impact on Fat Loss', thumb: '/Courses/WL_Video6.png', url: 'https://www.youtube.com/watch?v=4Osm1FbzU4E' },
    ],
  },
  gain: {
    label: 'Weight Gain',
    subtitle: 'Build lean muscle mass with the right nutrition approach.',
    videos: [
      { title: 'How Weight Gain Actually Works',    thumb: '/Courses/WG_Video1.png', url: 'https://www.youtube.com/watch?v=nAgZBJ9C3AI' },
      { title: 'How Many Calories YOU Need',        thumb: '/Courses/WG_Video2.png', url: 'https://www.youtube.com/watch?v=dYuIHgwNFJQ' },
      { title: 'Clean Bulking vs Dirty Bulking',    thumb: '/Courses/WG_Video3.png', url: 'https://www.youtube.com/watch?v=gXL7gmHkYfM' },
      { title: 'Best Foods for Weight Gain',        thumb: '/Courses/WG_Video4.png', url: 'https://www.youtube.com/watch?v=VrKubUJNSvY' },
      { title: 'Role of Carbs in Muscle Gain',      thumb: '/Courses/WG_Video5.png', url: 'https://www.youtube.com/watch?v=1sbO08tOce4' },
      { title: 'Healthy Fats for Weight Gain',      thumb: '/Courses/WG_Video6.png', url: 'https://www.youtube.com/watch?v=7DggjBF5jJA' },
    ],
  },
};

function NutritionTab() {
  const [course, setCourse] = useState('loss');
  const active = NUTRITION_COURSES[course];

  return (
    <div className="ft-content">
      <h2>Nutrition</h2>
      <p className="ft-guide-subtitle">Knowledge is the foundation of every transformation. Choose your goal.</p>

      <div className="ft-type-toggle">
        <button className={course === 'loss' ? 'active' : ''} onClick={() => setCourse('loss')}>Weight Loss</button>
        <button className={course === 'gain' ? 'active' : ''} onClick={() => setCourse('gain')}>Weight Gain</button>
      </div>

      <p className="ft-nutrition-subtitle">{active.subtitle}</p>

      <div className="ft-nutrition-grid">
        {active.videos.map((v, i) => (
          <a key={v.url} href={v.url} target="_blank" rel="noreferrer" className="ft-nutrition-card">
            <div className="ft-nutrition-thumb-wrap">
              <img src={v.thumb} alt={v.title} className="ft-nutrition-thumb" />
              <div className="ft-nutrition-overlay">
                <span className="ft-nutrition-play">&#9654;</span>
              </div>
              <span className="ft-nutrition-num">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <div className="ft-nutrition-body">
              <span className="ft-nutrition-course-tag">{active.label}</span>
              <p className="ft-nutrition-title">{v.title}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}


const getISTDateString = () => {
  const now = new Date();
  return new Date(now.getTime() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
};

export default function FitnessTracker() {
  const { user } = useAuth();
  const [tab, setTab] = useState('today');
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [muscleMap, setMuscleMap] = useState({});
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [strengthGroups, setStrengthGroups] = useState([]);
  const [cardioGroups, setCardioGroups] = useState([]);
  // log tab
  const [logType, setLogType] = useState('strength'); // 'strength' | 'cardio'
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedExerciseName, setSelectedExerciseName] = useState('');
  // cardio log
  const [cardioExerciseName, setCardioExerciseName] = useState('');
  const [cardioCategory, setCardioCategory] = useState('');
  const [cardioDuration, setCardioDuration] = useState('');
  const [cardioNotes, setCardioNotes] = useState('');
  // progress tab
  const [progressType, setProgressType] = useState('strength');
  const [progressMuscle, setProgressMuscle] = useState('');
  const [progressExerciseName, setProgressExerciseName] = useState('');
  const [sets, setSets] = useState([{ reps: '', weight: '', notes: '' }]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [growthData, setGrowthData] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [stats, setStats] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [weightInput, setWeightInput] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchTodayWorkout();
    fetchExercises();
    fetchMuscleMap();
  }, [user]);

  useEffect(() => {
    if (tab === 'progress' && progressExerciseName) {
      const ex = exercises.find((e) => e.name === progressExerciseName);
      if (ex) fetchGrowthData(ex._id);
      else setGrowthData(null);
    } else if (tab === 'calendar') {
      fetchCalendar();
    } else if (tab === 'history') {
      fetchStats();
    } else if (tab === 'weight') {
      fetchWeightHistory();
    } else if (tab === 'log' || tab === 'progress') {
      fetchMuscleMap();
    }
  }, [tab, progressExerciseName]);

  const fetchMuscleMap = async () => {
    try {
      const res = await fetch(`${API}/api/muscle-exercises`, { credentials: 'include' });
      const json = await res.json();
      const map = json.data || {};
      setMuscleMap(map);
      setMuscleGroups(Object.keys(map).sort());
      setStrengthGroups(json.strengthGroups || []);
      setCardioGroups(json.cardioGroups || []);
    } catch (err) {
      console.error('Error fetching muscle map:', err);
    }
  };

  const fetchTodayWorkout = async () => {
    try {
      const res = await fetch(`${API}/api/workouts/today`, {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const json = await res.json();
      setTodayWorkout(json.data || null);
    } catch (error) {
      console.error('Error fetching today\'s workout:', error);
    }
  };

  const fetchExercises = async () => {
    try {
      const res = await fetch(`${API}/api/exercises?limit=50`, { credentials: 'include' });
      const json = await res.json();
      setExercises(json.data?.data || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrowthData = async (exerciseId) => {
    try {
      const res = await fetch(`${API}/api/exercises/${exerciseId}/growth`, { credentials: 'include' });
      const json = await res.json();
      setGrowthData(json.data || []);
    } catch (error) {
      console.error('Error fetching growth data:', error);
    }
  };

  const fetchCalendar = async () => {
    try {
      const endDate = getISTDateString();
      const istNow = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
      const startDate = new Date(istNow.getFullYear() - 1, istNow.getMonth(), istNow.getDate() + 1)
        .toISOString().split('T')[0];
      const res = await fetch(`${API}/api/workouts/calendar?startDate=${startDate}&endDate=${endDate}`, { credentials: 'include' });
      const json = await res.json();
      setCalendar(json.data || []);
    } catch (error) {
      console.error('Error fetching calendar:', error);
    }
  };

  const fetchWeightHistory = async () => {
    try {
      const res = await fetch(`${API}/api/bodyweight?days=90`, { credentials: 'include' });
      const json = await res.json();
      setWeightHistory(json.data || []);
    } catch (err) {
      console.error('Error fetching weight history:', err);
    }
  };

  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!weightInput) return showMessage('Please enter your weight', 'error');
    try {
      const res = await fetch(`${API}/api/bodyweight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ weight_kg: parseFloat(weightInput) }),
      });
      const json = await res.json();
      if (json.success) {
        showMessage('Weight logged successfully', 'success');
        setWeightInput('');
        fetchWeightHistory();
      } else {
        showMessage(json.message, 'error');
      }
    } catch (err) {
      showMessage('Error logging weight', 'error');
    }
  };

  const fetchStats = async () => {
    try {
      const istNow = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
      const startDate = new Date(istNow.getFullYear(), istNow.getMonth(), 1).toISOString().split('T')[0];
      const endDate = getISTDateString();
      const res = await fetch(`${API}/api/workouts/stats?startDate=${startDate}&endDate=${endDate}`, { credentials: 'include' });
      const json = await res.json();
      setStats(json.data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleLogExercise = async (e) => {
    e.preventDefault();
    if (!selectedMuscle || !selectedExerciseName) return showMessage('Please select a muscle group and exercise', 'error');
    const validSets = sets.filter((s) => s.reps || s.weight);
    if (validSets.length === 0) return showMessage('Please enter at least one set', 'error');
    try {
      const dbExercise = exercises.find((ex) => ex.name.toLowerCase() === selectedExerciseName.toLowerCase());
      const res = await fetch(`${API}/api/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          exerciseId: dbExercise?._id || '000000000000000000000000',
          exerciseName: selectedExerciseName,
          sets: validSets,
          date: getISTDateString(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        showMessage(`${selectedExerciseName} logged successfully`, 'success');
        setSets([{ reps: '', weight: '', notes: '' }]);
        setSelectedMuscle('');
        setSelectedExerciseName('');
        fetchTodayWorkout();
      } else {
        showMessage(json.message, 'error');
      }
    } catch (error) {
      showMessage('Error logging exercise', 'error');
      console.error(error);
    }
  };

  const handleLogCardio = async (e) => {
    e.preventDefault();
    if (!cardioCategory || !cardioExerciseName) return showMessage('Please select a cardio category and exercise', 'error');
    if (!cardioDuration) return showMessage('Please enter duration', 'error');
    try {
      const res = await fetch(`${API}/api/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          exerciseId: '000000000000000000000000',
          exerciseName: cardioExerciseName,
          sets: [{ duration: parseFloat(cardioDuration) * 60, notes: cardioNotes }],
          date: getISTDateString(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        showMessage(`${cardioExerciseName} logged successfully`, 'success');
        setCardioCategory('');
        setCardioExerciseName('');
        setCardioDuration('');
        setCardioNotes('');
        fetchTodayWorkout();
      } else {
        showMessage(json.message, 'error');
      }
    } catch (error) {
      showMessage('Error logging cardio', 'error');
      console.error(error);
    }
  };

  const addSet = () => setSets([...sets, { reps: '', weight: '', notes: '' }]);
  const removeSet = (idx) => setSets(sets.filter((_, i) => i !== idx));
  const updateSet = (idx, field, value) => {
    const newSets = [...sets];
    newSets[idx][field] = value;
    setSets(newSets);
  };

  if (!user) {
    return (
      <div className="ft-page ft-container">
        <p className="ft-auth-msg">Please login to access Fitness Tracker</p>
        <a href="/login" className="btn-primary">Member Login</a>
      </div>
    );
  }

  const TABS = [
    { key: 'today',     label: "Today's Workout" },
    { key: 'log',       label: 'Log Exercise' },
    { key: 'cardio',    label: 'Log Cardio' },
    { key: 'progress',  label: 'Progress' },
    { key: 'weight',    label: 'Weight' },
    { key: 'calendar',  label: 'Calendar' },
    { key: 'nutrition', label: 'Nutrition' },
    { key: 'guide',     label: 'Beginner Guide' },
    { key: 'share',     label: 'Share Card' },
  ];

  const firstName = (user.name || 'Athlete').split(' ')[0];
  const istHour = Number(new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }));
  const greeting = istHour < 12 ? 'Good morning' : istHour < 17 ? 'Good afternoon' : 'Good evening';
  const todayLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' });
  const todayExerciseCount = todayWorkout?.exercises?.length || 0;
  const todaySetCount = (todayWorkout?.exercises || []).reduce((n, ex) => n + (ex.sets?.length || 0), 0);

  return (
    <div className="ft-page">
      <TrackerNavbar activeTab={tab} onTabChange={setTab} tabs={TABS} />

      <div className="ft-body">

      {message.text && (
        <div className={`ft-message ${message.type}`}>{message.text}</div>
      )}

      {/* TODAY */}
      {tab === 'today' && (
        <>
        <section className="ft-hero">
          <div className="ft-hero-text">
            <span className="ft-hero-date">{todayLabel}</span>
            <h1>{greeting}, <span>{firstName}</span></h1>
            <p>Every rep counts. Let&apos;s make today one to remember.</p>
          </div>
          <div className="ft-hero-stats">
            <div className="ft-hero-stat">
              <span className="ft-hero-stat-num">{todayExerciseCount}</span>
              <span className="ft-hero-stat-lbl">Exercises today</span>
            </div>
            <div className="ft-hero-stat">
              <span className="ft-hero-stat-num">{todaySetCount}</span>
              <span className="ft-hero-stat-lbl">Sets today</span>
            </div>
            <div className="ft-hero-actions">
              <button className="btn-primary" onClick={() => setTab('log')}>+ Log Exercise</button>
              <button className="btn-outline" onClick={() => setTab('cardio')}>+ Log Cardio</button>
              <button className="btn-outline ft-share-btn" onClick={() => setTab('share')}>Share my workout ↗</button>
            </div>
          </div>
        </section>
        <div className="ft-content">
          <h2>Today&apos;s Workout</h2>
          {todayWorkout && todayWorkout.exercises.length > 0 ? (
            <div className="ft-exercises">
              {todayWorkout.exercises.map((ex) => (
                <div key={ex._id} className="ft-exercise-card">
                  <div className="ft-exercise-card-header">
                    <span className="ft-exercise-name">{ex.name}</span>
                    <span className="ft-exercise-sets-count">{ex.sets.length} {ex.sets.length === 1 ? 'set' : 'sets'}</span>
                  </div>
                  <table className="ft-sets-table">
                    <thead>
                      <tr>
                        <th>Set</th>
                        {ex.sets.some(s => s.reps) && <th>Reps</th>}
                        {ex.sets.some(s => s.weight) && <th>Weight</th>}
                        {ex.sets.some(s => s.volume) && <th>Volume</th>}
                        {ex.sets.some(s => s.duration) && <th>Duration</th>}
                        {ex.sets.some(s => s.notes) && <th>Comment</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {ex.sets.map((set, idx) => (
                        <tr key={idx}>
                          <td className="ft-set-num">{idx + 1}</td>
                          {ex.sets.some(s => s.reps) && <td>{set.reps || '—'}</td>}
                          {ex.sets.some(s => s.weight) && <td>{set.weight ? `${set.weight} kg` : '—'}</td>}
                          {ex.sets.some(s => s.volume) && <td>{set.volume || '—'}</td>}
                          {ex.sets.some(s => s.duration) && <td>{set.duration ? `${Math.round(set.duration / 60)} min` : '—'}</td>}
                          {ex.sets.some(s => s.notes) && <td className="ft-set-note">{set.notes || '—'}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <div className="ft-empty">
              <p>No workout logged today. Start by logging an exercise.</p>
            </div>
          )}
        </div>
        </>
      )}

      {/* LOG */}
      {tab === 'log' && (
        <div className="ft-content">
          <h2>Log Exercise</h2>

          <div className="ft-type-toggle">
            <button className={logType === 'strength' ? 'active' : ''} onClick={() => { setLogType('strength'); setSelectedMuscle(''); setSelectedExerciseName(''); }}>Strength Training</button>
            <button className={logType === 'cardio' ? 'active' : ''} onClick={() => { setLogType('cardio'); setCardioCategory(''); setCardioExerciseName(''); }}>Cardio</button>
          </div>

          {logType === 'strength' ? (
            <form onSubmit={handleLogExercise}>
              <div className="ft-two-col">
                <div className="form-group">
                  <label>Muscle Group</label>
                  <select value={selectedMuscle} onChange={(e) => { setSelectedMuscle(e.target.value); setSelectedExerciseName(''); }}>
                    <option value="">Select muscle group...</option>
                    {strengthGroups.filter(g => muscleMap[g]).map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Exercise</label>
                  <select value={selectedExerciseName} onChange={(e) => setSelectedExerciseName(e.target.value)} disabled={!selectedMuscle}>
                    <option value="">{selectedMuscle ? 'Select exercise...' : 'Select muscle group first'}</option>
                    {selectedMuscle && (muscleMap[selectedMuscle] || []).map((ex) => (
                      <option key={ex} value={ex}>{ex}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="ft-sets-section">
                <p className="ft-sets-label">Sets</p>
                {sets.map((set, idx) => (
                  <div key={idx} className="ft-set-input">
                    <input type="number" placeholder="Reps" value={set.reps} onChange={(e) => updateSet(idx, 'reps', e.target.value)} />
                    <input type="number" placeholder="Weight (kg)" value={set.weight} onChange={(e) => updateSet(idx, 'weight', e.target.value)} />
                    <input type="text" placeholder="Notes" value={set.notes} onChange={(e) => updateSet(idx, 'notes', e.target.value)} />
                    {sets.length > 1 && (
                      <button type="button" className="ft-btn-remove" onClick={() => removeSet(idx)}>Remove</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="ft-form-actions">
                <button type="button" className="btn-outline" onClick={addSet}>+ Add Set</button>
                <button type="submit" className="btn-primary">Log Exercise</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogCardio}>
              <div className="ft-two-col">
                <div className="form-group">
                  <label>Cardio Category</label>
                  <select value={cardioCategory} onChange={(e) => { setCardioCategory(e.target.value); setCardioExerciseName(''); }}>
                    <option value="">Select category...</option>
                    {cardioGroups.filter(g => muscleMap[g]).map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Exercise</label>
                  <select value={cardioExerciseName} onChange={(e) => setCardioExerciseName(e.target.value)} disabled={!cardioCategory}>
                    <option value="">{cardioCategory ? 'Select exercise...' : 'Select category first'}</option>
                    {cardioCategory && (muscleMap[cardioCategory] || []).map((ex) => (
                      <option key={ex} value={ex}>{ex}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="ft-two-col">
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input type="number" min="1" placeholder="e.g. 30" value={cardioDuration} onChange={(e) => setCardioDuration(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <input type="text" placeholder="e.g. outdoor, 5km" value={cardioNotes} onChange={(e) => setCardioNotes(e.target.value)} />
                </div>
              </div>
              <div className="ft-form-actions">
                <button type="submit" className="btn-primary">Log Cardio</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* CARDIO TAB */}
      {tab === 'cardio' && (
        <div className="ft-content">
          <h2>Log Cardio</h2>
          <form onSubmit={handleLogCardio}>
            <div className="ft-two-col">
              <div className="form-group">
                <label>Cardio Category</label>
                <select value={cardioCategory} onChange={(e) => { setCardioCategory(e.target.value); setCardioExerciseName(''); }}>
                  <option value="">Select category...</option>
                  {cardioGroups.filter(g => muscleMap[g]).map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Exercise</label>
                <select value={cardioExerciseName} onChange={(e) => setCardioExerciseName(e.target.value)} disabled={!cardioCategory}>
                  <option value="">{cardioCategory ? 'Select exercise...' : 'Select category first'}</option>
                  {cardioCategory && (muscleMap[cardioCategory] || []).map((ex) => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ft-two-col">
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input type="number" min="1" placeholder="e.g. 30" value={cardioDuration} onChange={(e) => setCardioDuration(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input type="text" placeholder="e.g. outdoor, 5km" value={cardioNotes} onChange={(e) => setCardioNotes(e.target.value)} />
              </div>
            </div>
            <div className="ft-form-actions">
              <button type="submit" className="btn-primary">Log Cardio</button>
            </div>
          </form>
        </div>
      )}

      {/* PROGRESS */}
      {tab === 'progress' && (
        <div className="ft-content">
          <h2>Progress Tracking</h2>

          <div className="ft-two-col">
            <div className="form-group">
              <label>Muscle Group</label>
              <select value={progressMuscle} onChange={(e) => { setProgressMuscle(e.target.value); setProgressExerciseName(''); setGrowthData(null); }}>
                <option value="">Select muscle group...</option>
                {strengthGroups.filter(g => muscleMap[g]).map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Exercise</label>
              <select value={progressExerciseName} onChange={(e) => setProgressExerciseName(e.target.value)} disabled={!progressMuscle}>
                <option value="">{progressMuscle ? 'Select exercise...' : 'Select muscle group first'}</option>
                {progressMuscle && (muscleMap[progressMuscle] || []).map((ex) => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            </div>
          </div>

          {growthData && growthData.length > 0 ? (
            <>
              <div className="ft-chart-wrap">
                <div className="ft-chart-label">Total Volume (kg &times; reps)</div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={growthData.map((p) => ({ ...p, date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }))} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="date" tick={CHART.tick} axisLine={false} tickLine={false} />
                    <YAxis tick={CHART.tick} axisLine={false} tickLine={false} width={48}>
                      <Label value="kg × reps" angle={-90} position="insideLeft" offset={-2} style={CHART.label} />
                    </YAxis>
                    <Tooltip
                      contentStyle={CHART.tooltip}
                      cursor={{ stroke: 'rgba(227,39,27,0.35)', strokeWidth: 1 }}
                      labelStyle={{ fontWeight: 700, color: '#F4F4F2', marginBottom: 4 }}
                      itemStyle={{ color: '#ff6b4a' }}
                      formatter={(val) => [`${val} kg×reps`, 'Volume']}
                    />
                    <Line type="monotone" dataKey="total_volume" name="Total Volume" stroke={CHART.line} strokeWidth={2.5} dot={{ r: 3.5, fill: '#0A0A0B', stroke: CHART.line, strokeWidth: 2 }} activeDot={{ r: 6, fill: CHART.line, stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="ft-table-wrap">
                <table className="ft-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Max Weight</th>
                      <th>Total Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {growthData.map((point, idx) => (
                      <tr key={idx}>
                        <td>{new Date(point.date).toLocaleDateString()}</td>
                        <td>{point.max_weight || '-'} kg</td>
                        <td>{point.total_volume || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="ft-empty"><p>{progressExerciseName ? 'No data available for this exercise.' : 'Select a muscle group and exercise to view progress.'}</p></div>
          )}
        </div>
      )}

      {/* WEIGHT TRACKER */}
      {tab === 'weight' && (
        <div className="ft-content">
          <h2>Weight Tracker</h2>

          <div className="ft-weight-tips">
            <p>Your weight can fluctuate due to water retention — a sudden increase doesn&apos;t mean fat gain.</p>
            <p>Stay consistent. Real progress shows over weeks, not days.</p>
            <p>Track the trend, not the number.</p>
          </div>
          <form onSubmit={handleLogWeight} className="ft-weight-form">
            <div className="form-group">
              <label>Today&apos;s Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                placeholder="e.g. 75.5"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary">Log Weight</button>
          </form>

          {weightHistory.length > 0 ? (
            <>
              <div className="ft-weight-stats">
                {(() => {
                  const weights = weightHistory.map((e) => e.weight_kg);
                  const latest = weights[weights.length - 1];
                  const first = weights[0];
                  const diff = (latest - first).toFixed(1);
                  const min = Math.min(...weights).toFixed(1);
                  const max = Math.max(...weights).toFixed(1);
                  return [
                    { label: 'Current', value: `${latest} kg` },
                    { label: 'Change (90d)', value: `${diff > 0 ? '+' : ''}${diff} kg` },
                    { label: 'Lowest', value: `${min} kg` },
                    { label: 'Highest', value: `${max} kg` },
                  ].map(({ label, value }) => (
                    <div key={label} className="ft-stat-card">
                      <span className="ft-stat-label">{label}</span>
                      <span className="ft-stat-value">{value}</span>
                    </div>
                  ));
                })()}
              </div>

              <div className="ft-chart-wrap">
                <div className="ft-chart-label">Body Weight (kg)</div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart
                    data={weightHistory.map((e) => ({
                      date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      weight: e.weight_kg,
                    }))}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="date" tick={CHART.tick} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={CHART.tick}
                      axisLine={false} tickLine={false} width={48}
                      domain={['auto', 'auto']}
                    >
                      <Label value="kg" angle={-90} position="insideLeft" offset={-2} style={CHART.label} />
                    </YAxis>
                    <Tooltip
                      contentStyle={CHART.tooltip}
                      cursor={{ stroke: 'rgba(227,39,27,0.35)', strokeWidth: 1 }}
                      labelStyle={{ fontWeight: 700, color: '#F4F4F2', marginBottom: 4 }}
                      itemStyle={{ color: '#ff6b4a' }}
                      formatter={(val) => [`${val} kg`, 'Weight']}
                    />
                    <Line type="monotone" dataKey="weight" stroke={CHART.line} strokeWidth={2.5} dot={{ r: 3.5, fill: '#0A0A0B', stroke: CHART.line, strokeWidth: 2 }} activeDot={{ r: 6, fill: CHART.line, stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="ft-empty"><p>No weight entries yet. Log your first reading above.</p></div>
          )}
        </div>
      )}

      {/* CALENDAR */}
      {tab === 'calendar' && (() => {
        const workoutSet = new Set(calendar);
        const todayStr = getISTDateString();

        // Build last 12 months array ending at current month
        const months = [];
        const istNow = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
        for (let i = 11; i >= 0; i--) {
          const d = new Date(istNow.getFullYear(), istNow.getMonth() - i, 1);
          months.push({ year: d.getFullYear(), month: d.getMonth() });
        }

        return (
          <div className="ft-content">
            <h2>Workout Calendar — Last 12 Months</h2>
            <div className="ft-cal-year">
              {months.map(({ year, month }) => {
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const firstDow = new Date(year, month, 1).getDay();
                const label = new Date(year, month, 1).toLocaleString('en-US', { month: 'short', year: '2-digit' });
                return (
                  <div key={`${year}-${month}`} className="ft-cal-month">
                    <div className="ft-cal-month-label">{label}</div>
                    <div className="ft-cal-mini-grid">
                      {['S','M','T','W','T','F','S'].map((d, i) => (
                        <div key={i} className="ft-cal-day-name">{d}</div>
                      ))}
                      {Array.from({ length: firstDow }).map((_, i) => (
                        <div key={`e-${i}`} className="ft-cal-cell ft-cal-cell-empty" />
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const hasWorkout = workoutSet.has(dateStr);
                        const isToday = dateStr === todayStr;
                        return (
                          <div
                            key={dateStr}
                            title={dateStr}
                            className={`ft-cal-cell${hasWorkout ? ' ft-cal-cell-worked' : ''}${isToday ? ' ft-cal-cell-today' : ''}`}
                          >{day}</div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="ft-cal-legend">
              <div className="ft-cal-cell" />
              <span>No workout</span>
              <div className="ft-cal-cell ft-cal-cell-worked" />
              <span>Workout logged</span>
            </div>
          </div>
        );
      })()}

      {/* SHARE CARD */}
      {tab === 'share' && (
        <div className="ft-content">
          <h2>Share Card</h2>
          <p className="ft-guide-subtitle">Snap a selfie, choose your PR and stats, and post your workout to Instagram — Strava-style.</p>
          <ShareStudio defaultName={firstName} />
        </div>
      )}

      {/* NUTRITION */}
      {tab === 'nutrition' && <NutritionTab />}

      {/* BEGINNER GUIDE */}
      {tab === 'guide' && (() => {
        const GUIDES = [
          {
            name: 'Lat Pull Down',
            image: '/ExerciseTutorial/LatPullDown.png',
            muscle: 'Back',
            videos: [
              { label: 'Tutorial 1', url: 'https://youtube.com/shorts/bNmvKpJSWKM' },
              { label: 'Tutorial 2', url: 'https://www.youtube.com/shorts/h_II9FcSgZ0' },
            ],
          },
          {
            name: 'Seated Rows',
            image: '/ExerciseTutorial/SeatedRows.png',
            muscle: 'Back',
            videos: [
              { label: 'Tutorial 1', url: 'https://www.youtube.com/shorts/qD1WZ5pSuvk' },
              { label: 'Tutorial 2', url: 'https://www.youtube.com/shorts/yrRHFZ3MDxA' },
            ],
          },
          {
            name: 'Incline Bench Press',
            image: '/ExerciseTutorial/BenchPress.png',
            muscle: 'Chest',
            videos: [
              { label: 'Tutorial 1', url: 'https://www.youtube.com/shorts/98HWfiRonkE' },
              { label: 'Tutorial 2', url: 'https://www.youtube.com/shorts/MRmeUet5VUw' },
            ],
          },
          {
            name: 'Pec Fly',
            image: '/ExerciseTutorial/PecFly.png',
            muscle: 'Chest',
            videos: [
              { label: 'Tutorial 1', url: 'https://www.youtube.com/shorts/a9vQ_hwIksU' },
              { label: 'Tutorial 2', url: 'https://www.youtube.com/shorts/NEXwXAJ3D2A' },
            ],
          },
          {
            name: 'Leg Extension',
            image: '/ExerciseTutorial/LegExtension.png',
            muscle: 'Legs',
            imgPosition: 'bottom',
            videos: [
              { label: 'Tutorial 1', url: 'https://www.youtube.com/shorts/uM86QE59Tgc' },
              { label: 'Tutorial 2', url: 'https://www.youtube.com/shorts/iQ92TuvBqRo' },
            ],
          },
          {
            name: 'Leg Curls',
            image: '/ExerciseTutorial/LegCurls.png',
            muscle: 'Hamstrings',
            imgPosition: 'bottom',
            videos: [
              { label: 'Tutorial 1', url: 'https://www.youtube.com/shorts/xdbEG3xGLI8' },
              { label: 'Tutorial 2', url: 'https://www.youtube.com/shorts/_lgE0gPvbik' },
            ],
          },
          {
            name: 'Barbell Curls',
            image: '/ExerciseTutorial/BarbellCurls.png',
            muscle: 'Biceps',
            videos: [
              { label: 'Tutorial 1', url: 'https://www.youtube.com/shorts/54x2WF1_Suc' },
              { label: 'Tutorial 2', url: 'https://www.youtube.com/shorts/MKWBV29S6c0' },
            ],
          },
          {
            name: 'Pulley Push Down',
            image: '/ExerciseTutorial/PulleyPushDown.png',
            muscle: 'Triceps',
            videos: [
              { label: 'Tutorial 1', url: 'https://www.youtube.com/shorts/Rc7-euA8FDI' },
              { label: 'Tutorial 2', url: 'https://www.youtube.com/shorts/u36jNfqh8_U' },
            ],
          },
          {
            name: 'Shoulder Press',
            image: '/ExerciseTutorial/ShoulderPress.png',
            muscle: 'Shoulders',
            imgPosition: 'top',
            videos: [
              { label: 'Tutorial 1', url: 'https://www.youtube.com/shorts/k6tzKisR3NY' },
              { label: 'Tutorial 2', url: 'https://www.youtube.com/shorts/cOKFf_8z3NM' },
            ],
          },
          {
            name: 'Lateral Raises',
            image: '/ExerciseTutorial/LateralRaises.png',
            muscle: 'Shoulders',
            imgPosition: 'top',
            videos: [
              { label: 'Tutorial 1', url: 'https://www.youtube.com/shorts/Kl3LEzQ5Zqs' },
              { label: 'Tutorial 2', url: 'https://www.youtube.com/shorts/iK22GwXJji0' },
            ],
          },
        ];

        return (
          <div className="ft-content">
            <h2>Beginner Guide</h2>
            <p className="ft-guide-subtitle">Learn proper form before you lift. Watch both tutorials for each exercise.</p>
            <div className="ft-guide-grid">
              {GUIDES.map((g) => (
                <div key={g.name} className="ft-guide-card">
                  <div className="ft-guide-img-wrap">
                    <img src={g.image} alt={g.name} className="ft-guide-img" style={g.imgPosition ? { objectPosition: g.imgPosition } : {}} />
                    <span className="ft-guide-muscle">{g.muscle}</span>
                    <span className="ft-guide-img-name">{g.name}</span>
                  </div>
                  <div className="ft-guide-body">
                    <div className="ft-guide-btns">
                      {g.videos.map((v, i) => (
                        <a key={v.url} href={v.url} target="_blank" rel="noreferrer" className="ft-guide-btn">
                          Watch {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* STATS */}
      {tab === 'history' && (
        <div className="ft-content">
          <h2>Monthly Statistics</h2>
          {stats && Object.keys(stats).length > 0 ? (
            <div className="ft-stats-grid">
              {[
                { label: 'Total Workouts', value: stats.total_workouts || 0 },
                { label: 'Total Exercises', value: stats.total_exercises || 0 },
                { label: 'Total Sets', value: stats.total_sets || 0 },
                { label: 'Total Volume', value: `${(stats.total_volume || 0).toFixed(0)} kg` },
              ].map(({ label, value }) => (
                <div key={label} className="ft-stat-card">
                  <span className="ft-stat-label">{label}</span>
                  <span className="ft-stat-value">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="ft-empty"><p>No statistics available.</p></div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
