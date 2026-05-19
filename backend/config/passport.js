// backend/config/passport.js

const passport   = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email     = profile.emails[0].value.toLowerCase();
        const avatarUrl = profile.photos?.[0]?.value || "";
        const name      = profile.displayName;

        // 1. User already signed up with Google before → just log them in
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // 2. Same email exists (old password-based account) → link Google to it
        user = await User.findOne({ email });
        if (user) {
          user.googleId = profile.id;
          // Only set avatar if they haven't uploaded a custom one
          if (!user.avatar) user.avatar = avatarUrl;
          await user.save();
          return done(null, user);
        }

        // 3. Brand new user → create account (no password needed)
        user = await User.create({
          name,
          email,
          googleId: profile.id,
          avatar:   avatarUrl,
          password: "GOOGLE_AUTH_NO_PASSWORD", // satisfies required field; never used
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;