import { useState } from "react";
import { useAuth } from "~/context/AuthContext";
import { storageEnabled } from "~/firebase/config";
import { createPost } from "~/firebase/posts";

export function PostComposer() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await createPost(user, title, imageFile);
      setTitle("");
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
    >
      <textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What's happening?"
        maxLength={280}
        rows={3}
        className="w-full resize-none bg-transparent text-zinc-100 placeholder-zinc-500 outline-none"
      />

      {imagePreview && (
        <div className="relative mt-3">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-48 rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={() => {
              setImageFile(null);
              setImagePreview(null);
            }}
            className="absolute right-2 top-2 rounded-full bg-zinc-900/80 px-2 py-1 text-xs text-zinc-300 hover:text-white"
          >
            Remove
          </button>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3">
        <div className="flex items-center gap-3">
          {storageEnabled && (
            <label className="cursor-pointer text-sm text-sky-400 hover:text-sky-300">
              Add image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
          <span className="text-xs text-zinc-600">{title.length}/280</span>
        </div>

        <button
          type="submit"
          disabled={!title.trim() || submitting}
          className="rounded-full bg-sky-500 px-5 py-1.5 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Posting…" : "Post"}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </form>
  );
}
