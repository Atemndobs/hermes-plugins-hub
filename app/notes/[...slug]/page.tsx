import Link from "next/link";
import { notFound } from "next/navigation";
import { getNote } from "../../../lib/notes";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const fullSlug = slug.join("/");
  const n = await getNote(fullSlug);
  if (!n) return { title: "Note not found · Agent OS" };
  return {
    title: `${n.title} · Notes`,
    description: n.summary ?? undefined,
  };
}

function fmtDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const fullSlug = slug.join("/");
  const n = await getNote(fullSlug);
  if (!n) notFound();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/notes"
          className="mb-8 inline-flex text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← All notes
        </Link>

        <article className="flex flex-col gap-6">
          <header className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              {n.date && <span>{fmtDate(n.date)}</span>}
              {n.tags.length > 0 && (
                <span className="ml-2 flex flex-wrap gap-1">
                  {n.tags.map((t) => (
                    <span key={t} className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px]">
                      {t}
                    </span>
                  ))}
                </span>
              )}
              <a
                href={n.htmlUrl}
                className="ml-auto text-xs text-zinc-500 hover:text-zinc-300"
              >
                Edit on GitHub →
              </a>
            </div>
          </header>

          {/* Plain pre rendering keeps deploys simple — readable for any
              markdown without pulling in a renderer + sanitizer. Upgrade to
              react-markdown later if rich rendering is needed. */}
          <pre className="whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 font-sans text-[15px] leading-relaxed text-zinc-300">
            {n.body}
          </pre>
        </article>
      </div>
    </main>
  );
}
