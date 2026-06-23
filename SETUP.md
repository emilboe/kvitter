# Kvitter Setup Guide

This guide walks you through cloning Kvitter, connecting your own Firebase project, and deploying to Firebase Hosting. No prior Firebase experience required.

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- A Google account
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`

## 1. Clone and install

```bash
git clone <your-repo-url>
npm install
```

## 2. Create a Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the prompts.
3. Google Analytics is optional — you can disable it for this tutorial.

## 3. Register a web app

1. In your Firebase project, click the **Web** icon (`</>`) to add an app.
2. Give it a nickname (e.g. "Kvitter") and register the app.
3. Copy the `firebaseConfig` object values — you'll paste them into `.env` in the next step.

## 4. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the values from your Firebase web app config:

```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Set to false if you don't want to set up Cloud Storage (text-only posts)
VITE_ENABLE_STORAGE=true
```

> **Text-only mode:** Set `VITE_ENABLE_STORAGE=false` to skip Cloud Storage entirely. Posts will be text-only and you can skip step 7 below.

## 5. Enable Google Authentication

1. In Firebase Console, go to **Build → Authentication**.
2. Click **Get started**.
3. On the **Sign-in method** tab, enable **Google**.
4. Set a support email and save.
5. Go to **Settings → Authorized domains** and confirm `localhost` is listed (it's there by default). After deploying, add your Firebase Hosting domain (e.g. `your-project.web.app`).

## 6. Create Firestore database

1. Go to **Build → Firestore Database**.
2. Click **Create database**.
3. Choose **Production mode** (we'll deploy our own rules).
4. Pick a region close to your users.

Deploy the security rules from this repo:

```bash
cp .firebaserc.example .firebaserc
# Edit .firebaserc and replace "your-firebase-project-id" with your project ID

firebase login
firebase deploy --only firestore:rules
```

The rules in `[firestore.rules](./firestore.rules)` allow:

- **Anyone** to read posts (public feed)
- **Signed-in users** to create posts (must set `userId` to their own UID)
- **Post owners only** to edit or delete their posts

## 7. Enable Cloud Storage (optional)

Skip this step if `VITE_ENABLE_STORAGE=false`.

1. Go to **Build → Storage**.
2. Click **Get started** and choose **Production mode**.
3. Pick the same region as Firestore.

Deploy storage rules:

```bash
firebase deploy --only storage
```

The rules in `[storage.rules](./storage.rules)` allow public image reads and restrict uploads to each user's own folder (`posts/{userId}/...`).

## 8. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). You should see the Kvitter feed. Sign in with Google to create a post.

Open a second browser tab (or incognito window) to verify realtime updates — new posts appear instantly without refreshing.

## 9. Deploy to Firebase Hosting

Build the app and deploy:

```bash
npm run deploy
```

Or step by step:

```bash
npm run build
firebase deploy --only hosting
```

Your app will be live at `https://your-project-id.web.app`.

After deploying, add your hosting domain to **Authentication → Settings → Authorized domains** so Google sign-in works in production.

## Project structure (Firebase-related files)

```
app/firebase/
  config.ts    ← Firebase initialization (Auth, Firestore, optional Storage)
  auth.ts      ← Google sign-in / sign-out
  posts.ts     ← Firestore CRUD + realtime onSnapshot listener

firestore.rules   ← Database security rules
storage.rules     ← Storage security rules (optional)
firebase.json     ← Hosting + rules config
.env              ← Your Firebase credentials (never commit this)
```

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"

Add your domain to **Authentication → Settings → Authorized domains**. Include both `localhost` for dev and your `.web.app` domain for production.

### "Missing or insufficient permissions"

Deploy Firestore rules: `firebase deploy --only firestore:rules`. Make sure you're signed in when creating posts.

### "The query requires an index"

Firestore may ask you to create a composite index for `orderBy("createdAt")`. Click the link in the browser console error — Firebase will create it automatically.

### Blank page / "Invalid API key"

Check that `.env` values match your Firebase web app config exactly. Restart the dev server after changing `.env`.

### Image upload fails

- Confirm `VITE_ENABLE_STORAGE=true` in `.env`
- Enable Cloud Storage in Firebase Console
- Deploy storage rules: `firebase deploy --only storage`
- Or set `VITE_ENABLE_STORAGE=false` for text-only mode

### Realtime updates not working

Ensure Firestore is created and rules are deployed. Check the browser console for permission errors.

## What's next?

- Read through the commented code in `app/firebase/` to understand each Firebase service
- Try editing `[firestore.rules](./firestore.rules)` to require sign-in for reading posts
- Add a like counter or user profile page as a stretch goal

