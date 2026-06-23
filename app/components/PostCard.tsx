import { useState } from "react";
import { useAuth } from "~/context/AuthContext";
import { storageEnabled } from "~/firebase/config";
import {
  deletePost,
  formatRelativeTime,
  updatePost,
  type Post,
} from "~/firebase/posts";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const isOwner = user?.uid === post.userId;

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim() || saving) return;

    setSaving(true);
    setError(null);

    try {
      await updatePost(post.id, title, imageFile, post.imageUrl);
      setEditing(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting || !confirm("Delete this post?")) return;

    setDeleting(true);
    setError(null);

    try {
      await deletePost(post.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setTitle(post.title);
    setImageFile(null);
    setImagePreview(null);
    setError(null);
  };

  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-start gap-3">
        {post.userPhotoURL ? (
          <img
            src={post.userPhotoURL}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full ring-2 ring-zinc-700"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-medium text-zinc-400">
            {post.username.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-zinc-100">{post.username}</span>
            <span className="text-sm text-zinc-500">
              · {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          {editing ? (
            <div className="mt-2 space-y-3">
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={280}
                rows={3}
                className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-zinc-100 outline-none focus:border-sky-500"
              />

              {(imagePreview || post.imageUrl) && (
                <img
                  src={imagePreview ?? post.imageUrl}
                  alt=""
                  className="max-h-48 rounded-lg object-cover"
                />
              )}

              {storageEnabled && (
                <label className="cursor-pointer text-sm text-sky-400 hover:text-sky-300">
                  Change image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setImageFile(file);
                      setImagePreview(file ? URL.createObjectURL(file) : null);
                    }}
                    className="hidden"
                  />
                </label>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!title.trim() || saving}
                  className="rounded-lg bg-sky-500 px-3 py-1 text-sm text-white hover:bg-sky-400 disabled:opacity-40"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border border-zinc-700 px-3 py-1 text-sm text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-1 whitespace-pre-wrap text-zinc-200">
                {post.title}
              </p>

              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt=""
                  className="mt-3 max-h-80 w-full rounded-lg object-cover"
                />
              )}
            </>
          )}

          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

          {isOwner && !editing && (
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-sm text-zinc-500 hover:text-sky-400"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm text-zinc-500 hover:text-red-400 disabled:opacity-40"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
