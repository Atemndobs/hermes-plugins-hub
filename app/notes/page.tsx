import Link from "next/link";
import { listNotes } from "../../lib/notes";

export const revalidate = 3600;

export const metadata = {
  title: "Notes · Atem's Agent OS",
  description: "Field notes from building my agent operating system.",
};

const CATEGORY_LABEL: Record<string, string> = {
  tutorials: "Tutorial",
  patterns: "Pattern",
  recipes: "Recipe",
  decisions: "Decision",
  misc: "Note",
};

const CATEGORY_TONE: Record<string, string> = {
  tutorials: "border-emerald-900 bg-emerald-950/30 text-emerald-300",
  patterns: "border-violet-900 bg-violet-950/30 text-violet-300",
  recipes: "border-amber-900 bg-amber-950/30 text-amber-300",
  decisions: "border-sky-900 bg-sky-950/30 text-sky-300",
  misc: "border-zinc-800 bg-zinc-900 text-zinc-400",
};

function readMin(words: number): string {
  return Math.max(1, Math.round(words / 220)) + " min";
}

function fmtDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function NotesPage() {
  const notes = await listNotes();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10 flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Notes</h1>
          <p className="max-w-2xl text-zinc-400">
            Lab notebook from building my agent operating system. Tutorials I&apos;ve watched, patterns worth naming,
            recipes that work, decisions and why I made them. Polish optional, half-thoughts welcome.
          </p>
          <p className="text-xs text-zinc-600">
            Source:{" "}
            <a
              href="https://github.com/Atemndobs/agent-os-notes"
              className="underline decoration-zinc-700 underline-offset-2 hover:text-zinc-300"
            >
              github.com/Atemndobs/agent-os-notes
            </a>{" "}
            · auto-syncs hourly
          </p>
        </header>

        {notes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
            Notes loading… check back in a minute (GitHub indexing).
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {notes.map((n) => (
              <Link
                key={n.slug}
                href={`/notes/${n.slug}`}
                className="group flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-zinc-700 hover:bg-zinc-900"
              >
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide">
                  <span className={"rounded px-1.5 py-0.5 border " + (CATEGORY_TONE[n.category] || CATEGORY_TONE.misc)}>
                    {CATEGORY_LABEL[n.category] || n.category}
                  </span>
                  {n.date && <span className="text-zinc-500">{fmtDate(n.date)}</span>}
                  <span className="ml-auto text-zinc-600">{readMin(n.wordCount)} read</span>
                </div>
                <h2 className="font-semibold tracking-tight text-zinc-100">{n.title}</h2>
                {n.summary && <p className="text-sm text-zinc-400">{n.summary}</p>}
                {n.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {n.tags.slice(0, 5).map((t) => (
                      <span
                        key={t}
                        className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-500"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
