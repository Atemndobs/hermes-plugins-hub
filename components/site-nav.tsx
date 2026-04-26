import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-10 border-b border-zinc-900/80 bg-zinc-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-100">
          <span>⚕</span>
          <span>Agent OS</span>
        </Link>
        <div className="flex items-center gap-1 text-sm text-zinc-400">
          <NavLink href="/">Plugins</NavLink>
          <NavLink href="/notes">Notes</NavLink>
          <NavLink href="/stack">Stack</NavLink>
          <NavLink href="/journey">Journey</NavLink>
          <a
            href="https://github.com/Atemndobs"
            className="ml-2 rounded-md px-2 py-1 text-xs text-zinc-500 hover:text-zinc-200"
          >
            GitHub →
          </a>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-2.5 py-1 text-sm hover:bg-zinc-900 hover:text-zinc-100"
    >
      {children}
    </Link>
  );
}
