/**
 * Plugin discovery: GitHub Search API for repos tagged `hermes-plugin`.
 *
 * Source of truth = the GitHub topic. Anyone tagging their repo
 * `hermes-plugin` shows up here. No PR required to be listed.
 *
 * Per-repo manifest is fetched from `dashboard/manifest.json` if present.
 * Falls back to repo metadata if the manifest is missing.
 */

const GH = "https://api.github.com";
const TOPIC = "hermes-plugin";

export interface PluginManifest {
  name: string;
  label: string;
  description: string;
  icon?: string;
  version?: string;
  slots?: string[];
  tab?: { path?: string; position?: string; hidden?: boolean };
}

export interface Plugin {
  /** Slug used in URLs. Derived from manifest.name or repo name. */
  slug: string;
  manifest: PluginManifest;
  repo: {
    fullName: string; // "Atemndobs/hermes-plugin-credits"
    htmlUrl: string;
    description: string | null;
    stars: number;
    updatedAt: string;
    homepage: string | null;
    topics: string[];
    isTemplate: boolean;
  };
  /** Absolute URLs to screenshots auto-discovered in the repo. */
  screenshots: string[];
  readme: string | null;
}

const headers: HeadersInit = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
};

interface SearchRepo {
  full_name: string;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  updated_at: string;
  homepage: string | null;
  topics: string[];
  is_template: boolean;
  default_branch: string;
}

async function fetchManifest(repo: SearchRepo): Promise<PluginManifest | null> {
  const url = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/dashboard/manifest.json`;
  try {
    const r = await fetch(url, { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    return (await r.json()) as PluginManifest;
  } catch {
    return null;
  }
}

interface GitTreeEntry {
  path: string;
  type: "blob" | "tree";
}

/**
 * Find every PNG/JPG/WebP at the repo root, in /screenshots/, or in
 * /dashboard/ (the convention is `screenshot.png` or `screenshots/*.png`).
 * Returns absolute raw.githubusercontent URLs.
 */
async function fetchScreenshots(repo: SearchRepo): Promise<string[]> {
  try {
    const r = await fetch(
      `${GH}/repos/${repo.full_name}/git/trees/${repo.default_branch}?recursive=1`,
      { headers, next: { revalidate: 3600 } },
    );
    if (!r.ok) return [];
    const data = (await r.json()) as { tree?: GitTreeEntry[] };
    const tree = data.tree ?? [];
    const isImage = (p: string) => /\.(png|jpe?g|webp|gif)$/i.test(p);
    const wanted = tree.filter((e) => {
      if (e.type !== "blob" || !isImage(e.path)) return false;
      const p = e.path.toLowerCase();
      // Avoid logos / icons / favicons.
      if (/(^|\/)(logo|icon|favicon|apple-touch)/.test(p)) return false;
      return (
        p.startsWith("screenshot") ||
        p.startsWith("screenshots/") ||
        p.startsWith("dashboard/screenshot") ||
        p.startsWith("dashboard/screenshots/") ||
        p.startsWith("docs/screenshots/") ||
        p.startsWith(".github/screenshots/")
      );
    });
    return wanted
      .slice(0, 6)
      .map(
        (e) =>
          `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/${e.path}`,
      );
  } catch {
    return [];
  }
}

async function fetchReadme(repo: SearchRepo): Promise<string | null> {
  try {
    const r = await fetch(`${GH}/repos/${repo.full_name}/readme`, {
      headers: { ...headers, Accept: "application/vnd.github.raw" },
      next: { revalidate: 3600 },
    });
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  }
}

export async function listPlugins(): Promise<Plugin[]> {
  const r = await fetch(
    `${GH}/search/repositories?q=topic:${TOPIC}&sort=stars&order=desc&per_page=100`,
    { headers, next: { revalidate: 3600 } },
  );
  if (!r.ok) {
    console.error("github search failed", r.status, await r.text());
    return [];
  }
  const data = (await r.json()) as { items: SearchRepo[] };

  const plugins = await Promise.all(
    data.items
      // Skip templates from the listing — they're scaffolds, not plugins.
      .filter((repo) => !repo.is_template && !repo.topics.includes("template"))
      .map(async (repo): Promise<Plugin | null> => {
        const [manifest, screenshots] = await Promise.all([
          fetchManifest(repo),
          fetchScreenshots(repo),
        ]);
        const m: PluginManifest = manifest ?? {
          name: repo.name,
          label: repo.name,
          description: repo.description ?? "",
        };
        return {
          slug: m.name || repo.name,
          manifest: m,
          repo: {
            fullName: repo.full_name,
            htmlUrl: repo.html_url,
            description: repo.description,
            stars: repo.stargazers_count,
            updatedAt: repo.updated_at,
            homepage: repo.homepage,
            topics: repo.topics,
            isTemplate: repo.is_template,
          },
          screenshots,
          readme: null,
        };
      }),
  );

  // Sort: plugins with screenshots first (visual variety on the home page),
  // then by stars, then by recent update.
  return plugins
    .filter((p): p is Plugin => p !== null)
    .sort((a, b) => {
      const av = a.screenshots.length > 0 ? 1 : 0;
      const bv = b.screenshots.length > 0 ? 1 : 0;
      if (av !== bv) return bv - av;
      if (a.repo.stars !== b.repo.stars) return b.repo.stars - a.repo.stars;
      return (
        new Date(b.repo.updatedAt).getTime() -
        new Date(a.repo.updatedAt).getTime()
      );
    });
}

export async function getPlugin(slug: string): Promise<Plugin | null> {
  const all = await listPlugins();
  const match = all.find((p) => p.slug === slug);
  if (!match) return null;
  // Fetch the full README only on detail pages.
  const r = await fetch(`${GH}/repos/${match.repo.fullName}`, { headers, next: { revalidate: 3600 } });
  const repoData = (await r.json()) as SearchRepo;
  const readme = await fetchReadme(repoData);
  return { ...match, readme };
}
