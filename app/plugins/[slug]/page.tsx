import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlugin } from "../../../lib/plugins";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const p = await getPlugin(slug);
  if (!p) return { title: "Plugin not found · Hermes Plugins" };
  return {
    title: `${p.manifest.label} · Hermes Plugins`,
    description: p.manifest.description || p.repo.description || undefined,
  };
}

export default async function PluginPage({ params }: Props) {
  const { slug } = await params;
  const p = await getPlugin(slug);
  if (!p) notFound();

  const cloneUrl = `https://github.com/${p.repo.fullName}.git`;
  const installCmd = `mkdir -p ~/.hermes/plugins && git clone ${cloneUrl} ~/.hermes/plugins/${p.slug}`;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← All plugins
        </Link>

        <div className="mb-6 flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{p.manifest.label}</h1>
          <a
            href={p.author.htmlUrl}
            className="flex w-fit items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.author.avatarUrl}
              alt=""
              className="h-5 w-5 rounded-full"
            />
            <span>
              by <span className="font-medium text-zinc-200">@{p.author.login}</span>
            </span>
            {p.author.type === "Organization" && (
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                org
              </span>
            )}
          </a>
          <p className="font-mono text-xs text-zinc-500">{p.repo.fullName}</p>
          <p className="mt-1 text-zinc-300">
            {p.manifest.description || p.repo.description}
          </p>
        </div>

        {p.screenshots.length > 0 && (
          <section className="mb-8 flex flex-col gap-3">
            {p.screenshots.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt={`${p.manifest.label} screenshot`}
                loading="lazy"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950"
              />
            ))}
          </section>
        )}

        <section className="mb-8">
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-zinc-500">
            Install
          </h2>
          <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-200">
            <code>{installCmd}</code>
          </pre>
          <p className="mt-2 text-xs text-zinc-500">
            Then restart your Hermes dashboard, or hit <code>POST /api/dashboard/plugins/rescan</code>.
          </p>
        </section>

        <section className="mb-8 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Stat label="Version" value={p.manifest.version ? `v${p.manifest.version}` : "—"} />
          <Stat label="Stars" value={`★ ${p.repo.stars}`} />
          <Stat label="Slots" value={(p.manifest.slots ?? []).length ? (p.manifest.slots ?? []).join(", ") : "—"} />
          <Stat label="Tab" value={p.manifest.tab?.path || "—"} />
        </section>

        <section className="mb-8 flex flex-wrap gap-3">
          <a
            href={p.repo.htmlUrl}
            className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 hover:border-zinc-700 hover:text-zinc-100"
          >
            View on GitHub →
          </a>
          {p.repo.homepage && (
            <a
              href={p.repo.homepage}
              className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 hover:border-zinc-700 hover:text-zinc-100"
            >
              Homepage
            </a>
          )}
        </section>

        {p.readme && (
          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
              README
            </h2>
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 text-sm leading-relaxed text-zinc-300">
              {p.readme}
            </pre>
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 truncate text-zinc-200">{value}</div>
    </div>
  );
}
