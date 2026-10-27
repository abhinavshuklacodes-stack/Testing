# Orcible frontend

Responsive multi-page frontend for the Orcible AI workflow product.

## Files
- `index.html` — homepage and workflow prompt UI
- `login.html` — username/password login
- `register.html` — Google OAuth entry point, profile fields, and Orcible-specific password
- `history.html` — database-backed workflow history view
- `styles.css` — shared responsive design
- `app.js`, `auth.js`, `history.js` — page behavior

## Important: backend is not included
The frontend is ready to connect to an API, but authentication, Google OAuth, AI workflow generation, and database persistence require a backend. The page shows a useful workflow preview if the workflow endpoint is not connected; this is not real AI generation.

### Expected API contract
- `POST /api/auth/login` — `{ username, password }`
- `POST /api/auth/register` — `{ name, email, password }`
- `POST /api/auth/forgot-password` — `{ username }`
- `GET /api/auth/google` — starts Google OAuth; after successful OAuth, backend should return the user to `register.html` with name/email prefilled or manage registration server-side.
- `POST /api/workflows` — `{ prompt }` returns `{ workflow: { title, steps: [] } }`; can also accept `{ prompt, workflow, action: "save" }` to save.
- `GET /api/workflows` — returns `{ workflows: [{ id, title, prompt, createdAt, steps: [] }] }`, scoped to the authenticated user.

Use HTTPS in production, secure HttpOnly session cookies, server-side password hashing (Argon2id/bcrypt), CSRF protection where appropriate, rate limits, and server-side validation. Never store plaintext passwords or OAuth client secrets in frontend JavaScript. Google sign-in requires a Google OAuth client ID and a backend callback configured in Google Cloud Console.

## Run locally
Open `index.html` for a static visual preview. For API integration, serve these files through your backend or a local static server so relative `/api/...` routes reach your API.
