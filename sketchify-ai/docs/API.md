# Sketchify AI — API Reference

Base URL (local): `http://localhost:5000/api`
Auth: send `Authorization: Bearer <token>` (the token is also set as an
httpOnly cookie on login/register, so browser requests work without it).

## Auth

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/auth/register` | none | `{ name, email, password }` | Create an account |
| POST | `/auth/login` | none | `{ email, password }` | Log in |
| POST | `/auth/logout` | required | — | Clear session cookie |
| POST | `/auth/google` | none | `{ credential }` | Exchange a Google ID token for a session |
| POST | `/auth/forgot-password` | none | `{ email }` | Send a password reset email |
| POST | `/auth/reset-password` | none | `{ email, token, password }` | Reset password with the emailed token |
| GET | `/auth/me` | required | — | Get the current user |

## Images

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/images/upload` | required | `multipart/form-data: image` | Upload an image (PNG/JPG/JPEG/WEBP, ≤10MB) |
| POST | `/images/:id/convert` | required | `{ style, intensity, contrast, brightness, edgeSharpness }` | Convert an uploaded image via the AI service |
| GET | `/images` | required | query: `search, style, favorite, status, page, limit` | List the user's images |
| GET | `/images/:id` | required | — | Get a single image |
| PATCH | `/images/:id/favorite` | required | — | Toggle favorite |
| DELETE | `/images/:id` | required | — | Delete an image and its files |
| GET | `/images/stats/storage` | required | — | Storage usage stats |

`style` is one of `pencil`, `colored`, `charcoal`, `cartoon`.
`intensity`, `contrast`, `brightness`, `edgeSharpness` are integers 0–100.
Conversion runs in-process on the backend (`src/services/sketchEngine.js`,
built on Jimp) — there is no separate AI service endpoint to call.

## Users

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| PUT | `/users/me` | required | `{ name, avatarUrl }` | Update profile |
| PUT | `/users/me/password` | required | `{ currentPassword, newPassword }` | Change password (local accounts only) |
| DELETE | `/users/me` | required | — | Delete account |

## Admin (requires `role: admin`)

| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/admin/stats` | — | Platform-wide analytics |
| GET | `/admin/users` | query: `search, role, page, limit` | List users |
| PATCH | `/admin/users/:id` | `{ role, plan }` | Update a user's role/plan |
| DELETE | `/admin/users/:id` | — | Delete a user and their images |

## Error shape

```json
{ "success": false, "message": "Human-readable error" }
```
Validation errors additionally include:
```json
{ "errors": [{ "field": "email", "message": "Enter a valid email" }] }
```
