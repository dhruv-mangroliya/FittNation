require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const mongoose   = require('mongoose');
const session    = require('express-session');
const MongoStore = require('connect-mongo').MongoStore;
const passport   = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const https      = require('https');
const User       = require('./models/User');
const Branch     = require('./models/Branch');
const BRANCH_SEEDS = [
  {
    slug: 'mota-varachha',
    name: 'FittNation Mota Varachha',
    tag: 'Main Branch',
    address: 'Om Arcade, Aminapark Society, 17/18/19, next to Amideep Honda, Mota Varachha, Surat, Gujarat 394101',
    phone: '+91 98765 43210',
    hours: 'Mon–Sun: 5:00 AM – 11:00 PM',
    facilities: ['Weight Training', 'Cardio Zone', 'CrossFit', 'Personal Training', 'Locker Rooms', 'Parking'],
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.4!2d72.8824589!3d21.2440774!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f6c90e8d5b5%3A0xb5e4885ac901d777!2sFitt%20Nation%20Gym!5e0!3m2!1sen!2sin!4v1',
    mapLink: 'https://www.google.com/maps/place/Fitt+Nation+Gym/@21.2440774,72.8824589,17z',
  },
  {
    slug: 'dharam-nagar',
    name: 'FittNation Dharam Nagar',
    tag: null,
    address: '1 Floor, Sardavihar Soc, Sho 2-3, AK Rd, opp. Dharamjivan School, near Dharamnagr, Chkdi, Surat, Gujarat 395008',
    phone: '+91 98765 43211',
    hours: 'Mon–Sun: 5:00 AM – 11:00 PM',
    facilities: ['Weight Training', 'Cardio Zone', 'Group Classes', 'Yoga Studio', 'Locker Rooms'],
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.8!2d72.8518735!3d21.2210044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f0045408095%3A0x90c732401817f9d3!2sFitt%20Nation%20Gym!5e0!3m2!1sen!2sin!4v1',
    mapLink: 'https://www.google.com/maps/place/Fitt+Nation+Gym/@21.2210044,72.8518735,17z',
  },
  {
    slug: 'katargam',
    name: 'FittNation Katargam',
    tag: null,
    address: 'Gate no.1, Fitt nation gym, 1st floor, beside matrubhumi vidyalaya, Dabholi Char Rasta, Navjivan Society, Katargam, Surat, Gujarat 395004',
    phone: '+91 98765 43212',
    hours: 'Mon–Sun: 5:00 AM – 11:00 PM',
    facilities: ['Weight Training', 'Cardio Zone', 'Boxing Ring', 'Steam Room', 'Parking'],
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.2!2d72.8219436!3d21.2307825!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f4b12a07849%3A0x8e5a749066e20363!2sFitt%20Nation%20Gym!5e0!3m2!1sen!2sin!4v1',
    mapLink: 'https://www.google.com/maps/place/Fitt+Nation+Gym/@21.2210044,72.8518735,17z',
  },
];

const app  = express();
const PORT = process.env.PORT || 5001;

// ── MongoDB ──────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    for (const b of BRANCH_SEEDS) {
      await Branch.updateOne({ slug: b.slug }, { $setOnInsert: b }, { upsert: true });
    }
  })
  .catch((e) => console.error('MongoDB error:', e));

// ── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.set('etag', false);
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days
}));
app.use(passport.initialize());
app.use(passport.session());

// ── Passport Google Strategy ─────────────────────────────
passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  `http://localhost:${PORT}/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;

    // Admin login — no membership check needed
    if (email === process.env.ADMIN_EMAIL) {
      let user = await User.findOne({ email });
      if (!user) {
        const defaultBranch = await Branch.findOne({ slug: 'mota-varachha' });
        user = await User.create({
          userId:     'ADMIN',
          name:       profile.displayName,
          email,
          phone:      '',
          googleId:   profile.id,
          plan:       'Annual',
          branch:     defaultBranch._id,
          expiryDate: new Date('2099-12-31'),
        });
      } else {
        user.googleId = profile.id;
        if (!user.branch) {
          const defaultBranch = await Branch.findOne({ slug: 'mota-varachha' });
          user.branch = defaultBranch._id;
        }
        await user.save();
      }
      return done(null, user);
    }

    // Regular user — must be pre-registered by admin
    const user = await User.findOne({ email });
    if (!user) return done(null, false, { message: 'not_registered' });

    user.googleId = profile.id;
    await user.save();
    return done(null, user);
  } catch (e) {
    return done(e);
  }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (e) {
    done(e);
  }
});

// ── Routes ───────────────────────────────────────────────
app.use('/auth',       require('./routes/auth'));
app.use('/admin',      require('./routes/admin'));
app.use('/admin/roles', require('./routes/adminUsers'));

// Fitness Tracking Routes
app.use('/api/workouts',          require('./routes/workouts'));
app.use('/api/exercises',         require('./routes/exercises'));
app.use('/api/bodyweight',        require('./routes/bodyWeight'));
app.use('/api/muscle-exercises',  require('./routes/muscleExercises'));
app.use('/api',                   require('./routes/exerciseGroups'));

app.get('/api/branches', async (req, res) => {
  const branches = await Branch.find().sort({ createdAt: 1 });
  res.json(branches);
});
app.get('/api/branches/:slug', async (req, res) => {
  const branch = await Branch.findOne({ slug: req.params.slug });
  if (!branch) return res.status(404).json({ error: 'Branch not found' });
  res.json(branch);
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' });
  console.log('Contact form submission:', { name, email, message });
  res.json({ success: true, message: 'Message received!' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
