import type { Plugin } from "./plugins";

const CATEGORY_RULES: ReadonlyArray<readonly [string, RegExp]> = [
  ["memory", /\bmemor(y|ies)\b|membase|hippo|remnic|persistent\b/],
  ["search", /\bsearch\b|brave|tavily|firecrawl|exa\b/],
  ["ui", /\bui\b|dashboard|skin|theme|visual|animation|widget/],
  ["analytics", /analytic|cost|credit|quota|usage|telemetry/],
  ["automation", /workflow|automation|cron|schedule|runbook/],
  ["safety", /safety|guard|airlock|verifier|checkpoint/],
  [
    "social",
    /\bsocial\b|\btelegram\b|\bdiscord\b|\bwhatsapp\b|\bslack\b|\bx(?:[ /-]twitter|[ -](?:api|automation))\b|\btwitter\b|\btweet(?:s|ing)?\b|\bfollowers?\b|\bposting\b/,
  ],
  ["coding", /code|ast|tree-sitter|refactor|lsp/],
  ["food", /meal|recipe|food|fridge|kitchen/],
  ["time", /time|clock|klokkan|cron/],
];

/** Tag a plugin with coarse categories from its topics and descriptions. */
export function categorizePlugin(plugin: Plugin): string[] {
  const haystack = [
    ...(plugin.repo.topics ?? []),
    plugin.manifest.description,
    plugin.repo.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const tags: string[] = [];
  for (const [tag, pattern] of CATEGORY_RULES) {
    if (pattern.test(haystack)) tags.push(tag);
  }
  return tags;
}
