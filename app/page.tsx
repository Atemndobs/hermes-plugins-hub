import Link from "next/link";
import { listPlugins } from "../lib/plugins";

export const revalidate = 3600;

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d < 1) return "today";
  if (d < 30) return `${d}d ago`;
  const m = Math.floor(d / 30);
  if (m < 12) return `${m}mo ago`;
  return `${Math.floor(m / 12)}y ago`;
}

export default async function Home() {
  const plugins = await listPlugins();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="mb-12 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚕</span>
            <h1 className="text-3xl font-semibold tracking-tight">
              Hermes Plugins
            </h1>
          </div>
          <p className="max-w-2xl text-zinc-400">
            A directory of community plugins for{" "}
            <a
              className="underline decoration-zinc-600 underline-offset-4 hover:text-zinc-200"
              href="https://github.com/NousResearch/hermes-agent"
            >
              Hermes Agent
            </a>
            . Each plugin is a self-contained GitHub repo. Install by cloning
            into <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-xs text-zinc-300">~/.hermes/plugins/</code>.
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            <a
              href="https://github.com/Atemndobs/hermes-plugin-template"
              className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100"
            >
              Build your own →
            </a>
            <a
              href="https://github.com/topics/hermes-plugin"
              className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100"
            >
              Tag your repo <code className="text-xs">hermes-plugin</code> to be listed
            </a>
          </div>
        </header>

        {plugins.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
            No plugins found yet. Tag your repo with <code>hermes-plugin</code> on GitHub to appear here.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {plugins.map((p) => (
              <Link
                key={p.slug}
                href={`/plugins/${p.slug}`}
                className="group flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-zinc-700 hover:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold tracking-tight text-zinc-100">
                      {p.manifest.label || p.slug}
                    </h2>
                    <p className="mt-1 font-mono text-xs text-zinc-500">
                      {p.repo.fullName}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-zinc-500">
                    ★ {p.repo.stars}
                  </span>
                </div>
                <p className="text-sm text-zinc-400">
                  {p.manifest.description || p.repo.description || "—"}
                </p>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-600">
                  {p.manifest.version && <span>v{p.manifest.version}</span>}
                  <span>updated {relTime(p.repo.updatedAt)}</span>
                  {(p.manifest.slots ?? []).length > 0 && (
                    <span>· slots: {(p.manifest.slots ?? []).join(", ")}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <footer className="mt-20 border-t border-zinc-900 pt-8 text-xs text-zinc-600">
          <p>
            This index auto-updates hourly from the{" "}
            <code>hermes-plugin</code> GitHub topic. To submit a plugin: tag your repo and ship.
          </p>
        </footer>
      </div>
    </main>
  );
}
