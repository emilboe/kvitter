# Kvitter

A minimal Twitter-style feed with React and Firebase. Uses Auth, Firestore, and optional Cloud Storage.

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- A Google account
- [Firebase CLI](https://firebase.google.com/docs/cli) (for deploying rules and hosting): `npm install -g firebase-tools`

## Get started

```bash
git clone <your-repo-url>
cd <repo-directory>
npm install
cp .env.example .env
```

See **[SETUP.md](./SETUP.md)** to create a Firebase project, fill in `.env`, and deploy.

Once Firebase is configured:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).
