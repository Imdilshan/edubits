const passport    = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { Strategy: GitHubStrategy } = require("passport-github2");
const User = require("../models/User");

// Passport calls the verify function as (accessToken, refreshToken, profile, done).
function findOrCreateUser(provider) {
  return async (accessToken, refreshToken, profile, done) => {
    try {
      const emailEntry = profile.emails?.find((entry) =>
        entry.verified === true && (provider !== "github" || entry.primary === true)
      );
      const verifiedEmail = emailEntry?.value || (
        provider === "google" && profile._json?.email_verified === true
          ? profile._json.email
          : ""
      );
      const email = verifiedEmail.toLowerCase();
      const avatarUrl = profile.photos?.[0]?.value || profile._json?.avatar_url || profile._json?.picture || "";
      const name = profile.displayName || profile._json?.name || profile.username;

      if (!email) {
        return done(new Error(`${provider} profile missing a verified email`), null);
      }

      const providerIdField = `${provider}Id`;
      const query = { [providerIdField]: profile.id };
      let user = await User.findOne(query).select("+password");
      if (user) {
        // Remove the legacy shared placeholder value from OAuth accounts when
        // they next sign in. New OAuth accounts have no password credential.
        if (user.password === `${provider.toUpperCase()}_AUTH_NO_PASSWORD`) {
          user.password = undefined;
          await user.save();
        }
        return done(null, user);
      }

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
const hasRealOAuthCredential = (value) => Boolean(value) &&
  !/<[^>]+>|^(your[_ -]?|replace|change[_ -]?me|example)/i.test(value);
// In production, return OAuth through the frontend's same-origin /api proxy so
// the auth cookie is first-party. Local development keeps the callback on the
// backend unless explicitly overridden.
const oauthCallbackBaseUrl = process.env.OAUTH_CALLBACK_BASE_URL || (
  process.env.NODE_ENV === "development" ? backendUrl : process.env.FRONTEND_URL || backendUrl
);
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
  backendUrl && hasRealOAuthCredential(process.env.GOOGLE_CLIENT_ID) && hasRealOAuthCredential(process.env.GOOGLE_CLIENT_SECRET),
  () =>
    new GoogleStrategy(
      {
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:  `${oauthCallbackBaseUrl}/api/auth/google/callback`,
        scope: ["profile", "email"],
      },
      findOrCreateUser("google")
    )
);

register(
  "GitHub",
  backendUrl && hasRealOAuthCredential(process.env.GITHUB_CLIENT_ID) && hasRealOAuthCredential(process.env.GITHUB_CLIENT_SECRET),
  () =>
    new GitHubStrategy(
      {
        clientID:     process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL:  `${oauthCallbackBaseUrl}/api/auth/github/callback`,
        scope: ["user:email"],
        allRawEmails: true,
      },
      findOrCreateUser("github")
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
