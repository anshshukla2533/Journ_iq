import express from 'express';
import dotenv from "dotenv";

import connectDB from "./config/database.js";
dotenv.config();

import cors from 'cors'
import helmet from 'helmet'

import passport from './config/passport.js'
import session from 'express-session'
import authRoutes from './routes/auth.js'
import notesRoutes from './routes/notes.js'
import youtubeRoutes from './routes/youtube.js'
import timelineRoutes from './routes/timeline.js'
dotenv.config()

import messagesRoutes from './routes/messages.js';
import notificationsRoutes from './routes/notifications.js';
import noteShareRoutes from './routes/noteShare.js';
import friendsRoutes from './routes/friends.js';

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
// Configure CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: err.message });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/timeline', timelineRoutes);

app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/noteShare', noteShareRoutes);
app.use('/api/friends', friendsRoutes);

app.get('/', (req, res) => {
  res.send(' Backend is working');
});

import http from 'http';
import setupSocket from './socket.new.js';

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Configure socket.io with proper SSL settings
const io = setupSocket(server);

// Enhanced error handling for the server
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});


