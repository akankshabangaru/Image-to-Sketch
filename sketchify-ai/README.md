# Sketchify AI

Turn photos into pencil, colored, charcoal, or cartoon sketches. A simple
two-service full-stack app: a Next.js/TypeScript frontend and an
Express/MongoDB API that does the sketch conversion itself, in-process —
no separate AI microservice, no Python runtime, no extra network hop.

```
sketchify-ai/
├── frontend/     Next.js 14 (App Router) + TypeScript + Tailwind CSS
└── backend/      Node.js + Express + MongoDB (Mongoose) + JWT auth
                  + a built-in Jimp-based sketch engine (src/services/sketchEngine.js)
```

## How the conversion works

`backend/src/services/sketchEngine.js` implements four real, deterministic
image-processing algorithms on top of [Jimp](https://github.com/oliver-moran/jimp)
(pure JavaScript, no native bindings to compile or Docker system libraries to
install):

- **Pencil** — classic grayscale color-dodge blend (invert → blur → dodge),
  with a Sobel-edge overlay for defined linework.
- **Colored** — the same pencil luminance blended back with the original hue.
- **Charcoal** — a darker, higher-contrast pencil pass with a paper-grain
  noise overlay.
- **Cartoon** — box-blur smoothing + posterization + bold ink edges from
  Sobel edge detection.

It runs directly inside the Express request handler — upload a photo, call
`/api/images/:id/convert`, get a processed PNG back, no other service to
run or deploy. This is intentionally a "basic model": simple, fast (under
~150ms per image at 1200px), fully offline, and easy to read/extend. Swap
the body of `applyStyle()` for a real ML model later without changing its
`Buffer in -> Buffer out` signature.

The frontend also runs a lighter version of the same algorithms directly in
the browser (`frontend/src/lib/canvasSketch.ts`) for an instant live preview
while you drag the sliders, before you commit to the final backend-generated
version.

## What's real vs. what needs your keys

| Feature | Status |
|---|---|
| Pencil / colored / charcoal / cartoon conversion | ✅ Real algorithms, runs in-process, no setup |
| Client-side instant preview | ✅ Real canvas image processing, no network |
| Email + password auth, JWT, RBAC | ✅ Fully working |
| Forgot / reset password | ✅ Fully working (emails log to console until SMTP is configured) |
| Local image storage | ✅ Fully working (Docker volume / disk) |
| Google Sign-In | ⚙️ Wired end-to-end; needs a free Google OAuth Client ID |
| Real SMTP email delivery | ⚙️ Wired via Nodemailer; needs SMTP credentials |
| Cloudinary / S3 storage | ⚙️ `STORAGE_DRIVER` env flag ready; swap in the SDK calls where noted in `imageController.js` |

## Quick start (Docker, recommended)

```bash
cp backend/.env.example backend/.env       # fill in JWT_SECRET at minimum
cp frontend/.env.local.example frontend/.env.local
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

Seed an admin account:
```bash
docker compose exec backend npm run seed:admin
# logs in as admin@sketchify.ai / ChangeMe123! (override with SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD)
```

## Running each service locally (without Docker)

**Backend**
```bash
cd backend
cp .env.example .env   # set MONGO_URI to a local/Atlas Mongo instance
npm install
npm run dev
```

**Frontend**
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

## Enabling Google Sign-In

1. Create an OAuth Client ID (type: Web application) at the
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Add `http://localhost:3000` as an authorized JavaScript origin.
3. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `frontend/.env.local` and
   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `backend/.env`.
4. In production, swap the `jwt.decode()` call in
   `backend/src/controllers/authController.js` for
   `google-auth-library`'s `OAuth2Client.verifyIdToken()` — the comment in
   that file marks exactly where.

Until configured, the "Sign in with Google" button shows a clear inline
explainer instead of a broken button, and the email/password flow works
fully on its own.

## Switching to Cloudinary or S3 storage

`imageController.js` currently reads/writes files under `backend/uploads`.
To move to cloud storage:
1. Set `STORAGE_DRIVER=cloudinary` (or `s3`) and fill in the matching keys
   in `backend/.env`.
2. Replace the `fs.writeFileSync` / `fs.readFileSync` calls in
   `uploadImage` and `convertImage` with the Cloudinary or AWS SDK upload
   calls, storing the returned URL in `originalUrl` / `resultUrl` instead of
   a local path.

## API documentation

See [`docs/API.md`](./docs/API.md) for the full endpoint reference.

## Deployment

- **Frontend → Vercel**: import the `frontend/` folder as the project root,
  set `BACKEND_URL` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` as environment
  variables.
- **Backend → Render**: create a Web Service pointed at `backend/` (it has a
  `Dockerfile`), plus a managed MongoDB (Render, Atlas, etc.) and set
  `MONGO_URI` accordingly. Attach a persistent disk if staying on local
  storage, or switch to Cloudinary/S3 for production (see above).

## Security features included

JWT auth (header + httpOnly cookie), bcrypt password hashing, role-based
authorization middleware, per-route rate limiting (general/auth/upload),
Helmet security headers, Mongo query sanitization, express-validator input
validation on every mutating route, centralized error handling, and Winston
request/error logging.
