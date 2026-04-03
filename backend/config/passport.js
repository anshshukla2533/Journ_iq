import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../lib/prisma.js';
import { hasAuthAccountModel, hasUserUsernameField } from '../lib/prismaCapabilities.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:3000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `${profile.id}@google.com`;
        const providerAccountId = profile.id;
        const supportsAuthAccount = hasAuthAccountModel();
        const supportsUsername = hasUserUsernameField();

        if (supportsAuthAccount) {
          const existingAccount = await prisma.authAccount.findUnique({
            where: {
              provider_providerAccountId: {
                provider: 'google',
                providerAccountId,
              },
            },
            include: {
              user: true,
            },
          });

          if (existingAccount?.user) {
            return done(null, existingAccount.user);
          }
        }

        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              name:
                profile.displayName ||
                profile.name?.givenName ||
                email.split('@')[0] ||
                'Google User',
              email,
              ...(supportsUsername ? { username: profile.username || null } : {}),
            },
          });
        }

        if (supportsAuthAccount) {
          await prisma.authAccount.upsert({
            where: {
              provider_providerAccountId: {
                provider: 'google',
                providerAccountId,
              },
            },
            update: {
              accessToken: accessToken || null,
              refreshToken: refreshToken || null,
              userId: user.id,
            },
            create: {
              provider: 'google',
              providerAccountId,
              accessToken: accessToken || null,
              refreshToken: refreshToken || null,
              userId: user.id,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
