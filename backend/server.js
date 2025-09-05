import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import connectDB from './config/database.js'
import passport from './config/passport.js'
import session from 'express-session'
import authRoutes from './routes/auth.js'
import notesRoutes from './routes/notes.js'
import youtubeRoutes from './routes/youtube.js'
import timelineRoutes from './routes/timeline.js'
dotenv.config()
import friendsRoutes from './routes/friends.js';
import messagesRoutes from './routes/messages.js';
import notificationsRoutes from './routes/notifications.js';
import noteShareRoutes from './routes/noteShare.js';
const app = express()
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));
app.use(passport.initialize())
app.use(passport.session())
connectDB()
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, 
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, 
  message: {
    success: false,
    msg: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', limiter)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use('/api/auth', authRoutes)
app.use('/api/notes', notesRoutes)
app.use('/api/youtube', youtubeRoutes)
app.use('/api/timeline', timelineRoutes)
app.use('/api/friends', friendsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/noteShare', noteShareRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.get('/', (req, res) => {
  res.send(' Backend is working');
});

import http from 'http';
import setupSocket from './socket.js';

const PORT = process.env.PORT || 5001;
const server = http.createServer(app);
const io = setupSocket(server);
server.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});


