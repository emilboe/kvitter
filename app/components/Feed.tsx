import { useEffect, useState } from "react";
import { PostCard } from "./PostCard";
import type { Post } from "~/firebase/posts";
import { subscribeToPosts } from "~/firebase/posts";

// onSnapshot listener. Updates when posts change.
export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToPosts(
      (nextPosts) => {
        setPosts(nextPosts);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl bg-zinc-900"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-red-400">
        {error}
      </p>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="py-12 text-center text-zinc-500">
        No posts yet. Sign in and share the first one!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
