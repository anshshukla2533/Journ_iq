import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback',
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails && profile.emails[0]
      ? profile.emails[0].value
      : `${profile.id}@google.com`;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: profile.displayName || profile.emails[0]?.value.split('@')[0],
        email: email,
        password: Math.random().toString(36).slice(-8),
      });
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_ID,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5001/api/auth/github/callback',
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails && profile.emails[0]
      ? profile.emails[0].value
      : `${profile.username}@github.com`; // fallback fake email

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: profile.displayName || profile.username,
        email: email, // use the safe variable here
        password: Math.random().toString(36).slice(-8), // random password
      });
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
