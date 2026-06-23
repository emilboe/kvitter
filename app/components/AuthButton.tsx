import { signInWithGoogle, signOut } from "~/firebase/auth";
import { useAuth } from "~/context/AuthContext";

export function AuthButton() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-lg bg-zinc-800" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt=""
            className="h-8 w-8 rounded-full ring-2 ring-zinc-700"
          />
        )}
        <span className="hidden text-sm text-zinc-400 sm:inline">
          {user.displayName}
        </span>
        <button
          type="button"
          onClick={() => signOut()}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signInWithGoogle()}
      className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
    >
      Sign in with Google
    </button>
  );
}
