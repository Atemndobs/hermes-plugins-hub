"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Plugin } from "../lib/plugins";

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d < 1) return "today";
  if (d < 30) return `${d}d ago`;
  const m = Math.floor(d / 30);
  if (m < 12) return `${m}mo ago`;
  return `${Math.floor(m / 12)}y ago`;
}

/** Tag plugins with coarse categories from their topics + description text. */
function categorize(p: Plugin): string[] {
  const tags = new Set<string>();
  const haystack = (
    (p.repo.topics || []).join(" ") +
    " " +
    (p.manifest.description || "") +
    " " +
    (p.repo.description || "")
  ).toLowerCase();
  const rules: [string, RegExp][] = [
    ["memory", /\bmemor(y|ies)\b|membase|hippo|remnic|persistent\b/],
    ["search", /\bsearch\b|brave|tavily|firecrawl|exa\b/],
    ["ui", /\bui\b|dashboard|skin|theme|visual|animation|widget/],
    ["analytics", /analytic|cost|credit|quota|usage|telemetry/],
    ["automation", /workflow|automation|cron|schedule|runbook/],
    ["safety", /safety|guard|airlock|verifier|checkpoint/],
    ["social", /social|telegram|discord|whatsapp|slack/],
    ["coding", /code|ast|tree-sitter|refactor|lsp/],
    ["food", /meal|recipe|food|fridge|kitchen/],
    ["time", /time|clock|klokkan|cron/],
  ];
  for (const [tag, re] of rules) {
    if (re.test(haystack)) tags.add(tag);
  }
  return [...tags];
}

interface Props {
  plugins: Plugin[];
}

export function PluginGrid({ plugins }: Props) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const enriched = useMemo(
    () => plugins.map((p) => ({ ...p, _tags: categorize(p) })),
    [plugins],
  );

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of enriched) {
      for (const t of p._tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [enriched]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched.filter((p) => {
      if (activeTag && !p._tags.includes(activeTag)) return false;
      if (!q) return true;
      const hay = [
        p.manifest.label,
        p.slug,
        p.manifest.description,
        p.repo.fullName,
        p.repo.description,
        ...(p.repo.topics ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [enriched, query, activeTag]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3">
        <div className="relative">
          <input
            type="search"
            placeholder={`Search ${plugins.length} plugins by name, description, or topic…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              aria-label="Clear"
            >
              ×
            </button>
          )}
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={
                "rounded-full border px-3 py-1 text-xs transition " +
                (activeTag === null
                  ? "border-zinc-200 bg-zinc-100 text-zinc-900"
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200")
              }
            >
              All <span className="ml-1 text-zinc-500">{plugins.length}</span>
            </button>
            {allTags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={
                  "rounded-full border px-3 py-1 text-xs transition " +
                  (activeTag === tag
                    ? "border-zinc-200 bg-zinc-100 text-zinc-900"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200")
                }
              >
                {tag}{" "}
                <span className={activeTag === tag ? "text-zinc-600" : "text-zinc-500"}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
          No plugins match {query ? `"${query}"` : "this filter"}.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((p) => (
            <Link
              key={p.slug + p.repo.fullName}
              href={`/plugins/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40 transition hover:border-zinc-700 hover:bg-zinc-900"
            >
              {p.screenshots[0] ? (
                <div className="aspect-[16/7] overflow-hidden border-b border-zinc-800/80 bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.screenshots[0]}
                    alt={`${p.manifest.label} preview`}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              ) : (
                <PlaceholderCover label={p.manifest.label || p.slug} tags={p._tags} />
              )}
              <div className="flex flex-col gap-2 p-5">
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
                <p className="line-clamp-3 text-sm text-zinc-400">
                  {p.manifest.description || p.repo.description || "—"}
                </p>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-600">
                  {p.manifest.version && <span>v{p.manifest.version}</span>}
                  <span>updated {relTime(p.repo.updatedAt)}</span>
                  {p._tags.length > 0 && (
                    <span className="ml-auto flex flex-wrap gap-1">
                      {p._tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-500"
                        >
                          {t}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

/** Generated cover for plugins without a screenshot — uses the plugin name
 * to derive a deterministic gradient so each plugin has a distinct look. */
function PlaceholderCover({ label, tags }: { label: string; tags: string[] }) {
  const seed = [...label].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = seed % 360;
  return (
    <div
      className="relative flex aspect-[16/7] items-center justify-center overflow-hidden border-b border-zinc-800/80"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 40% 12%) 0%, hsl(${(hue + 40) % 360} 50% 18%) 100%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.06) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.04) 0%, transparent 40%)",
        }}
      />
      <span
        className="font-mono text-[11px] uppercase tracking-[0.4em]"
        style={{ color: `hsl(${hue} 40% 75%)` }}
      >
        {tags[0] ?? "plugin"}
      </span>
    </div>
  );
}
