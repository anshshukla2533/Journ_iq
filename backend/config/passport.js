import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/User.js";

// =======================
// 🟢 GOOGLE STRATEGY
// =======================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback", // backend route
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : `${profile.id}@google.com`;

        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            name:
              profile.displayName ||
              profile.emails?.[0]?.value.split("@")[0] ||
              "Google User",
            email,
            password: Math.random().toString(36).slice(-8),
          });
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// =======================
// 🔵 GITHUB STRATEGY
// =======================
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ||
        "http://localhost:3000/api/auth/github/callback", // fixed from 5001
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : `${profile.username}@github.com`;

        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            name: profile.displayName || profile.username || "GitHub User",
            email,
            password: Math.random().toString(36).slice(-8),
          });
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// =======================
// ⚙️ SESSION HANDLING
// =======================
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
