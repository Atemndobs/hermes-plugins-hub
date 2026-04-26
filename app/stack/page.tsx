export const metadata = { title: "Stack · Atem's Agent OS" };

interface Tool {
  name: string;
  role: string;
  why: string;
  href?: string;
}

const STACK: { layer: string; description: string; tools: Tool[] }[] = [
  {
    layer: "Foundations",
    description: "Vendor runtimes I never modify — pull updates, that's it.",
    tools: [
      { name: "Hermes Agent", role: "main agent runtime", why: "open, plugin-friendly, multi-platform gateway", href: "https://github.com/NousResearch/hermes-agent" },
      { name: "Claude Code", role: "Anthropic's CLI agent (Max plan)", why: "best Sonnet/Opus harness for long sessions", href: "https://claude.ai/code" },
      { name: "Codex CLI", role: "OpenAI's CLI agent (ChatGPT Plus)", why: "GPT-5-codex tight loop, fast iteration", href: "https://github.com/openai/codex" },
    ],
  },
  {
    layer: "Personal extensions",
    description: "Plugins, skills, hooks I've written. Each is its own repo.",
    tools: [
      { name: "hermes-plugin-credits", role: "provider quota widget", why: "visibility on burn rate across OpenRouter / Claude / OpenAI", href: "https://github.com/Atemndobs/hermes-plugin-credits" },
      { name: "hermes-plugin-template", role: "starter scaffold", why: "fork → ship a new plugin in 30s", href: "https://github.com/Atemndobs/hermes-plugin-template" },
    ],
  },
  {
    layer: "Knowledge garden",
    description: "Notes, patterns, recipes — public, pulled into /notes.",
    tools: [
      { name: "agent-os-notes", role: "lab notebook", why: "low-pressure place to capture what I learn", href: "https://github.com/Atemndobs/agent-os-notes" },
    ],
  },
  {
    layer: "Presentation",
    description: "This site. The discovery layer for everything above.",
    tools: [
      { name: "agent-os hub", role: "Next.js on Vercel", why: "auto-indexes plugins + notes from GitHub topics; zero CMS", href: "https://github.com/Atemndobs/hermes-plugins-hub" },
    ],
  },
];

export default function StackPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10 flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Stack</h1>
          <p className="max-w-2xl text-zinc-400">
            Everything I run, organized by layer. Foundations don&apos;t move; my extensions sit on top; notes capture
            the why; this site shows it all.
          </p>
        </header>

        <div className="flex flex-col gap-8">
          {STACK.map((section) => (
            <section key={section.layer}>
              <div className="mb-3">
                <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-400">
                  {section.layer}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">{section.description}</p>
              </div>
              <ul className="flex flex-col gap-2">
                {section.tools.map((t) => (
                  <li
                    key={t.name}
                    className="flex flex-col gap-1 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      {t.href ? (
                        <a
                          href={t.href}
                          className="font-medium text-zinc-100 underline decoration-zinc-700 underline-offset-4 hover:text-zinc-200"
                        >
                          {t.name}
                        </a>
                      ) : (
                        <span className="font-medium text-zinc-100">{t.name}</span>
                      )}
                      <span className="text-xs text-zinc-500">{t.role}</span>
                    </div>
                    <p className="text-sm text-zinc-400">{t.why}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
