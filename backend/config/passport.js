const passport    = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { Strategy: GitHubStrategy } = require("passport-github2");
const { Strategy: MicrosoftStrategy } = require("passport-microsoft");
const User = require("../models/User");

// Passport calls the verify function as (accessToken, refreshToken, profile, done).
function findOrCreateUser(provider) {
  return async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value?.toLowerCase() || profile._json?.email?.toLowerCase();
      const avatarUrl = profile.photos?.[0]?.value || profile._json?.avatar_url || profile._json?.picture || "";
      const name = profile.displayName || profile._json?.name || profile.username;

      if (!email) {
        return done(new Error(`${provider} profile missing email`), null);
      }

      const providerIdField = `${provider}Id`;
      const query = { [providerIdField]: profile.id };
      let user = await User.findOne(query);
      if (user) return done(null, user);

      user = await User.findOne({ email });
      if (user) {
        user[providerIdField] = profile.id;
        if (!user.avatar) user.avatar = avatarUrl;
        await user.save();
        return done(null, user);
      }

      user = await User.create({
        name,
        email,
        [providerIdField]: profile.id,
        avatar: avatarUrl,
        password: `${provider.toUpperCase()}_AUTH_NO_PASSWORD`,
      });

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  };
}

// Each strategy is registered only when its credentials exist, so a missing
// provider no longer crashes the whole server at startup.
const backendUrl = process.env.BACKEND_URL;
passport.enabledProviders = new Set();

function register(name, enabled, createStrategy) {
  if (!enabled) {
    console.warn(`[passport] ${name} OAuth disabled (missing credentials or BACKEND_URL)`);
    return;
  }
  passport.use(createStrategy());
  passport.enabledProviders.add(name.toLowerCase());
}

register(
  "Google",
  backendUrl && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  () =>
    new GoogleStrategy(
      {
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:  `${backendUrl}/api/auth/google/callback`,
        scope: ["profile", "email"],
      },
      findOrCreateUser("google")
    )
);

register(
  "GitHub",
  backendUrl && process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
  () =>
    new GitHubStrategy(
      {
        clientID:     process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL:  `${backendUrl}/api/auth/github/callback`,
        scope: ["user:email"],
      },
      findOrCreateUser("github")
    )
);

register(
  "Microsoft",
  backendUrl && process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET,
  () =>
    new MicrosoftStrategy(
      {
        clientID:     process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL:  `${backendUrl}/api/auth/microsoft/callback`,
        scope: ["user.read"],
        tenant: "common",
      },
      findOrCreateUser("microsoft")
    )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;