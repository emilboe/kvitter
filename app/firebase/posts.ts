import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  type UploadResult,
} from "firebase/storage";
import type { User } from "firebase/auth";
import {
  getFirebaseStorage,
  getFirestoreDb,
  storageEnabled,
} from "./config";

export interface Post {
  id: string;
  userId: string;
  username: string;
  userPhotoURL?: string;
  title: string;
  imageUrl?: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

interface PostDocument {
  userId: string;
  username: string;
  userPhotoURL?: string;
  title: string;
  imageUrl?: string;
  createdAt: ReturnType<typeof serverTimestamp>;
  updatedAt: ReturnType<typeof serverTimestamp>;
}

function getPostsCollection() {
  return collection(getFirestoreDb(), "posts");
}

// onSnapshot sets up a realtime listener — the callback fires whenever any client
// adds, edits, or deletes a post. This is what makes the feed update live.
export function subscribeToPosts(
  callback: (posts: Post[]) => void,
  onError?: (error: Error) => void,
) {
  const postsQuery = query(getPostsCollection(), orderBy("createdAt", "desc"));

  return onSnapshot(
    postsQuery,
    (snapshot) => {
      const posts = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Post[];
      callback(posts);
    },
    (error) => onError?.(error),
  );
}

export async function createPost(
  user: User,
  title: string,
  imageFile?: File | null,
) {
  let imageUrl: string | undefined;

  if (storageEnabled && imageFile) {
    imageUrl = await uploadImage(user.uid, imageFile);
  }

  const post: PostDocument = {
    userId: user.uid,
    username: user.displayName ?? "Anonymous",
    ...(user.photoURL ? { userPhotoURL: user.photoURL } : {}),
    title: title.trim(),
    ...(imageUrl ? { imageUrl } : {}),
    // serverTimestamp() uses Firestore's server clock — avoids client clock skew
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(getPostsCollection(), post);
}

export async function updatePost(
  postId: string,
  title: string,
  imageFile?: File | null,
  existingImageUrl?: string,
) {
  const updates: Record<string, unknown> = {
    title: title.trim(),
    updatedAt: serverTimestamp(),
  };

  if (storageEnabled && imageFile) {
    const postUserId = await getPostUserId(postId);
    if (postUserId) {
      updates.imageUrl = await uploadImage(postUserId, imageFile);
    }
  } else if (!imageFile && !existingImageUrl) {
    updates.imageUrl = null;
  }

  return updateDoc(doc(getFirestoreDb(), "posts", postId), updates);
}

export async function deletePost(postId: string) {
  return deleteDoc(doc(getFirestoreDb(), "posts", postId));
}

async function getPostUserId(postId: string): Promise<string | null> {
  const snap = await getDoc(doc(getFirestoreDb(), "posts", postId));
  return snap.exists() ? (snap.data().userId as string) : null;
}

// Uploads to posts/{userId}/{timestamp}-{filename} — path matches storage.rules
async function uploadImage(userId: string, file: File): Promise<string> {
  const storage = getFirebaseStorage();
  if (!storage) {
    throw new Error("Storage is not enabled");
  }

  const path = `posts/${userId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  const result: UploadResult = await uploadBytes(storageRef, file);
  return getDownloadURL(result.ref);
}

export function formatRelativeTime(timestamp: Timestamp | null): string {
  if (!timestamp) return "just now";

  const date = timestamp.toDate();
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
}
