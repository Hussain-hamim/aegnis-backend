import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile:', profile);

        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log('Found user by Google ID:', user.email);
          return done(null, user);
        }

        // Check if user exists with the same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          console.log(
            'Found user by email, linking Google account:',
            user.email
          );
          // Link Google account to existing user
          user.googleId = profile.id;
          user.avatar = profile.photos[0].value;
          user.provider = 'google';
          await user.save();
          return done(null, user);
        }

        // Create new Google user (no password needed)
        console.log('Creating new Google user:', profile.emails[0].value);
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          username: profile.displayName,
          // .toLowerCase()
          // .replace(/\s+/g, '_')
          // .substring(0, 30),
          avatar: profile.photos[0].value,
          provider: 'google',
          // No password field for Google users
        });

        console.log('Created new user:', user.email);
        return done(null, user);
      } catch (error) {
        console.error('Google strategy error:', error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
