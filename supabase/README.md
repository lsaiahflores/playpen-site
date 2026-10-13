# Connecting the beta form

1. Create a project at supabase.com (free tier is enough).
2. SQL editor: paste and run `beta_signups.sql` (this folder). It creates the table, a unique index on lower(email), and row-level
   security that lets anonymous visitors INSERT only.
3. Project settings > API: copy the **Project URL** and the **anon public** key.
4. Put both in `js/config.js`:

   ```js
   window.PLAYPEN_CONFIG = {
     SUPABASE_URL: "https://xxxxxxxx.supabase.co",
     SUPABASE_ANON_KEY: "eyJ..."
   };
   ```
5. Commit and push. Until both values are set, the form shows "not connected yet" and sends nothing.

The anon key is designed to be public. Never put the `service_role` key anywhere in this repo.

The page's Content-Security-Policy allows connections to `https://*.supabase.co` and `https://api.github.com` only.
