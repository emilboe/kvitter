import type { Route } from "./+types/home";
import { AuthButton } from "~/components/AuthButton";
import { Feed } from "~/components/Feed";
import { PostComposer } from "~/components/PostComposer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Kvitter" },
    { name: "description", content: "A simple realtime feed powered by Firebase" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold tracking-tight">Kvitter</h1>
          <AuthButton />
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-6 px-4 py-6">
        <PostComposer />
        <Feed />
      </main>
    </div>
  );
}
