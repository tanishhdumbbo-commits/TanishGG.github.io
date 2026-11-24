# TanishGG Platform

Bright, responsive portfolio with separate top-navigation pages, public Q&A/reviews/news, project budget requests, AI chat UI, and a private Supabase-backed admin portal.

## Included
- `index.html` + `assets/`: public portfolio and page navigation
- `admin.html`: Supabase Auth admin portal
- `supabase/schema.sql`: database tables and row-level security
- `supabase/functions/ask-ai/index.ts`: secure AI endpoint (API key stays server-side)

## Setup required before publishing
1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. In Authentication, create your own user. Copy its UUID and run the admin-grant SQL at the bottom of the schema.
4. Put your Supabase Project URL and anon/public key in `assets/app.js` (`SB_URL`, `SB_ANON_KEY`). The anon key is intended for browser use; RLS protects data.
5. Deploy the Edge Function and set secret `OPENAI_API_KEY` in Supabase. Never put an AI secret in browser JavaScript.
6. Upload the files to your GitHub repository and enable GitHub Pages.

## Team roles and links already included
- Tanish — Founder & Lead Developer
- Weirdmine — Developer; Discord: https://discord.com/users/1449633180494729400
- Sky — Helper · Team Staff only; Discord: https://discord.com/users/1541710506715250707
- Tanish email: tanishhdumbbo@gmail.com
- Tanish Discord: https://discord.com/users/1465283869195501670
- Tanish Instagram: https://www.instagram.com/tanishhhg?evlk=MTQxaGNlMDlwNGRnYg==

## Notes
The app deliberately does not include a fake hard-coded admin password. Admin login requires Supabase Auth and the `profiles.role = 'admin'` record. Reviews and questions stay pending until approved/answered. Budget requests are private under the included RLS policy. To change visible team/contact copy later, edit `assets/app.js`; full content CMS editing can be expanded by adding editable site-settings fields.
