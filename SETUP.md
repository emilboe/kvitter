# Kvitter Setup Guide

Assumes the repo is cloned, dependencies are installed, and `.env` exists (copied from `.env.example`).

## 1. Create a Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the prompts.
3. Google Analytics is optional.
4. Skip **Set up Hosting** if it appears in the wizard. Hosting gets configured when you run `firebase deploy` (step 9).

## 2. Register a web app

1. In your Firebase project, click the **Web** icon (`</>`) to add an app.
2. Give it a nickname (e.g. "Kvitter") and register the app.
3. Copy the `firebaseConfig` values. You'll paste them into `.env` next.

## 3. Configure environment variables

Open `.env` and fill in the values from your Firebase web app config:

```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Set to false for text-only posts (no Cloud Storage)
VITE_ENABLE_STORAGE=true
```

Set `VITE_ENABLE_STORAGE=false` to skip Cloud Storage. You can skip step 7.

## 4. Enable Google Authentication

1. In Firebase Console, go to **Security → Authentication**.
2. Click **Get started**.
3. On the **Sign-in method** tab, enable **Google**.
4. Set a support email and save.
5. After deploying (step 9), add your Firebase Hosting domain (e.g. `your-project.web.app`) under **Settings → Authorized domains**.

## 5. Create Firestore database

1. Go to **Database and storage → Firestore**.
2. Click **Create database**.
3. Choose **Production mode** (we deploy our own rules).
4. Pick a region close to your users.

## 6. Configure `.firebaserc`

The Firebase CLI needs to know which project to deploy to.

```bash
cp .firebaserc.example .firebaserc
```

Open `.firebaserc` and replace `your-firebase-project-id` with your project ID (same as `VITE_FIREBASE_PROJECT_ID` in `.env`):

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

Log in and deploy Firestore rules:

```bash
firebase login
firebase deploy --only firestore:rules
```

[`firestore.rules`](./firestore.rules):

- Anyone can read posts (public feed)
- Signed-in users can create posts (`userId` must match their UID)
- Only the post owner can edit or delete

## 7. Enable Cloud Storage (optional)

Skip if `VITE_ENABLE_STORAGE=false`.

1. Go to **Database and storage → Storage**.
2. Click **Get started** and choose **Production mode**.
3. Pick the closest available region.

```bash
firebase deploy --only storage
```

[`storage.rules`](./storage.rules): public reads, uploads restricted to `posts/{userId}/...`.

## 8. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Sign in with Google to create a post.

Open another tab or an incognito window to confirm new posts show up without a refresh.

## 9. Deploy to Firebase Hosting

```bash
npm run deploy
```

Or:

```bash
npm run build
firebase deploy --only hosting
```

Live at `https://your-project-id.web.app`.

Add your hosting domain under **Security → Authentication → Settings → Authorized domains** so Google sign-in works in production.

## Firebase files

```
app/firebase/
  config.ts       Firebase init (Auth, Firestore, optional Storage)
  auth.ts         Google sign-in / sign-out
  posts.ts        Firestore CRUD + onSnapshot listener

firestore.rules
storage.rules     optional
firebase.json
.firebaserc         never commit
.env              never commit
```

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"

Add your domain under **Security → Authentication → Settings → Authorized domains** (your `.web.app` domain after deploy).

### "Missing or insufficient permissions"

Run `firebase deploy --only firestore:rules`. You must be signed in to create posts.

### "The query requires an index"

Firestore may prompt you to create an index for `orderBy("createdAt")`. Click the link in the console error.

### Blank page / "Invalid API key"

Check `.env` against your Firebase web app config. Restart the dev server after changes.

### Image upload fails

- `VITE_ENABLE_STORAGE=true` in `.env`
- Cloud Storage enabled in the console
- `firebase deploy --only storage`
- Or set `VITE_ENABLE_STORAGE=false` for text-only

### Realtime updates not working

Firestore must exist and rules must be deployed. Check the browser console.
