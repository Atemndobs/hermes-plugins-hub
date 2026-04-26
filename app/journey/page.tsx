export const metadata = { title: "Journey · Atem's Agent OS" };

export default function JourneyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10 flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Journey</h1>
          <p className="max-w-2xl text-zinc-400">
            Why I&apos;m building an agent operating system, and what I&apos;m optimising for.
          </p>
        </header>

        <article className="flex flex-col gap-6 text-zinc-300">
          <p>
            I&apos;ve spent years collecting AI harnesses — Hermes, Claude Code, Codex, Cursor,
            and a dozen others. Each one solves a slice of the problem. None of them
            individually <em>is</em> my workflow.
          </p>
          <p>
            So I&apos;m building one. Not by rewriting any of them, but by composing them. Hermes is the
            spine — multi-platform gateway, plugin runtime, scheduler. Claude Code and Codex are
            the brains. My plugins fill the gaps. My notes capture the why.
          </p>
          <p>
            Everything you see on this site is real, in production on my own machine, and shareable.
            If a piece of my workflow is useful to you, install it. If you build something on top,
            tag your repo <code className="rounded bg-zinc-900 px-1 py-0.5 text-xs">hermes-plugin</code> and
            it&apos;ll appear in the directory automatically.
          </p>

          <hr className="my-4 border-zinc-900" />

          <h2 className="text-lg font-semibold tracking-tight text-zinc-100">What I&apos;m optimising for</h2>
          <ul className="ml-5 list-disc space-y-2 text-zinc-300">
            <li><strong>Composability over consolidation.</strong> Five small repos beat one big one.</li>
            <li><strong>Zero-conflict upstream pulls.</strong> Vendor code stays pristine; my work lives in <code className="rounded bg-zinc-900 px-1 text-xs">~/.hermes/plugins/</code>.</li>
            <li><strong>Public by default.</strong> If it doesn&apos;t involve credentials or clients, it goes on GitHub. I learn faster when I have to explain.</li>
            <li><strong>Build → write → ship.</strong> Every learning ends with &quot;what does this unlock?&quot; — usually a new plugin or skill.</li>
          </ul>

          <h2 className="text-lg font-semibold tracking-tight text-zinc-100">What&apos;s next</h2>
          <p>
            More plugins. Trading workflows. A bootstrap script that rebuilds my entire agent OS on
            a fresh machine in under five minutes. Notes, always.
          </p>
          <p className="text-sm text-zinc-500">
            Find me: <a href="https://github.com/Atemndobs" className="underline decoration-zinc-700 underline-offset-2 hover:text-zinc-300">github.com/Atemndobs</a>
          </p>
        </article>
      </div>
    </main>
  );
}
