/**
 * Notes loader: pulls markdown files from Atemndobs/agent-os-notes and
 * parses YAML frontmatter. Each note becomes a card on /notes.
 *
 * Source-of-truth pattern (same as plugins): GitHub is the database. ISR
 * caches for an hour.
 */

const REPO = "Atemndobs/agent-os-notes";
const GH = "https://api.github.com";

const headers: HeadersInit = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
};

export interface Note {
  /** Folder + filename basename (e.g. "decisions/2026-04-26-agent-os-architecture") */
  slug: string;
  /** Top-level folder ("tutorials", "patterns", "recipes", "decisions") */
  category: string;
  title: string;
  date: string | null;
  summary: string | null;
  tags: string[];
  body: string;
  /** Approx word count, used for read-time estimate */
  wordCount: number;
  /** Direct link to the file on GitHub */
  htmlUrl: string;
}

interface GitTreeEntry {
  path: string;
  type: "blob" | "tree";
}

/** Tiny YAML-frontmatter parser. Handles: scalars, lists ([a, b, c]), strings. */
function parseFrontmatter(md: string): { meta: Record<string, unknown>; body: string } {
  if (!md.startsWith("---")) return { meta: {}, body: md };
  const end = md.indexOf("\n---", 3);
  if (end === -1) return { meta: {}, body: md };
  const raw = md.slice(3, end).trim();
  const body = md.slice(end + 4).replace(/^\s*\n/, "");
  const meta: Record<string, unknown> = {};
  for (const line of raw.split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value: string = line.slice(colon + 1).trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      meta[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      // strip surrounding quotes
      value = value.replace(/^["']|["']$/g, "");
      meta[key] = value;
    }
  }
  return { meta, body };
}

async function fetchTree(): Promise<GitTreeEntry[]> {
  try {
    const r = await fetch(`${GH}/repos/${REPO}/git/trees/main?recursive=1`, {
      headers,
      next: { revalidate: 3600 },
    });
    if (!r.ok) return [];
    const data = (await r.json()) as { tree?: GitTreeEntry[] };
    return data.tree ?? [];
  } catch {
    return [];
  }
}

async function fetchFile(path: string): Promise<string | null> {
  try {
    const r = await fetch(
      `https://raw.githubusercontent.com/${REPO}/main/${path}`,
      { next: { revalidate: 3600 } },
    );
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  }
}

function slugFromPath(path: string): string {
  return path.replace(/\.md$/i, "");
}

function categoryFromPath(path: string): string {
  const i = path.indexOf("/");
  return i === -1 ? "misc" : path.slice(0, i);
}

function titleFromBody(body: string, fallback: string): string {
  const m = body.match(/^#\s+(.+)/m);
  return m ? m[1].trim() : fallback;
}

export async function listNotes(): Promise<Note[]> {
  const tree = await fetchTree();
  const mdFiles = tree.filter(
    (e) =>
      e.type === "blob" &&
      e.path.endsWith(".md") &&
      e.path !== "README.md",
  );

  const notes = await Promise.all(
    mdFiles.map(async (entry): Promise<Note | null> => {
      const raw = await fetchFile(entry.path);
      if (!raw) return null;
      const { meta, body } = parseFrontmatter(raw);
      const wordCount = body.split(/\s+/).filter(Boolean).length;
      return {
        slug: slugFromPath(entry.path),
        category: categoryFromPath(entry.path),
        title: (meta.title as string) || titleFromBody(body, entry.path),
        date: (meta.date as string) || null,
        summary: (meta.summary as string) || null,
        tags: Array.isArray(meta.tags) ? (meta.tags as string[]) : [],
        body,
        wordCount,
        htmlUrl: `https://github.com/${REPO}/blob/main/${entry.path}`,
      };
    }),
  );

  return notes
    .filter((n): n is Note => n !== null)
    .sort((a, b) => {
      if (a.date && b.date) return b.date.localeCompare(a.date);
      if (a.date) return -1;
      if (b.date) return 1;
      return 0;
    });
}

export async function getNote(slug: string): Promise<Note | null> {
  const all = await listNotes();
  return all.find((n) => n.slug === slug) ?? null;
}
