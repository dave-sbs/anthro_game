import Link from 'next/link';

const navItems = [
  { label: 'The game', href: '/play' },
  { label: 'Stories', href: '/stories' },
  { label: 'About', href: '#about' },
  { label: 'Customize', href: '/play/customize' },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--cream)] text-[var(--ink)]">
      {/* <div className="pointer-events-none absolute -left-40 top-36 h-[520px] w-[520px] rounded-full border border-[var(--ink)]/15" /> */}
      {/* <div className="pointer-events-none absolute -right-28 bottom-10 h-[360px] w-[360px] rounded-full bg-[var(--lavender)]/40 blur-3xl" /> */}
      {/* <div className="pointer-events-none absolute left-1/2 top-[76%] h-20 w-[120vw] -translate-x-1/2 -rotate-6 rounded-full bg-[var(--ink)] shadow-2xl" /> */}
      <p className="pointer-events-none absolute left-1/2 top-[76%] w-[140vw] -translate-x-1/2 -rotate-6 whitespace-nowrap text-center text-lg font-semibold tracking-tight text-[var(--cream)]">
        roll the die, find the detour, leave a memory, follow the ramp, tell the story
      </p>

      <header className="relative z-10 mx-auto flex w-[min(92vw,920px)] items-center justify-between rounded-xl border border-[var(--ink)]/15 bg-[var(--cream-card)]/75 px-4 py-2.5 shadow-sm backdrop-blur-md md:mt-5">
        <Link href="/" className="flex items-center gap-2 text-sm font-extrabold">
          <span className="flex h-6 w-6 items-end gap-0.5">
            <span className="h-3 w-1.5 rounded-full bg-[var(--ink)]" />
            <span className="h-5 w-1.5 rounded-full bg-[var(--ink)]" />
            <span className="h-4 w-1.5 rounded-full bg-[var(--ink)]" />
          </span>
          Colby: Stairs and Ramps
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="hover:opacity-60">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/play"
            className="hidden rounded-lg border-2 border-[var(--ink)] px-4 py-2 text-sm font-bold shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5 md:inline-flex"
          >
            Play
          </Link>
          <Link
            href="/stories"
            className="rounded-lg border-2 border-[var(--ink)] bg-[var(--lavender)] px-4 py-2 text-sm font-bold shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5"
          >
            Stories
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] w-[min(92vw,1000px)] flex-col items-center justify-center px-2 pb-24 pt-16 text-center">
        <p className="mb-8 max-w-sm text-sm font-medium leading-relaxed text-[var(--ink)]/60">
          A campus board game about access, detours, care, and the routes people remember.
        </p>

        <h1 className="font-display max-w-5xl text-[clamp(4rem,13vw,9.5rem)] font-medium leading-[0.86] tracking-[-0.075em]">
          <span className="text-[#8e8b80]">Colby&apos;s campus,</span>{' '}
          <span className="text-[var(--ink)]">as a board game</span>
        </h1>

        <div className="flex flex-col mt-12 items-center gap-3">
          <p className="mt-8 max-w-md text-lg font-semibold leading-snug">
            Start with the game, or wander through the notes people left behind on the board.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/play"
              className="rounded-xl border-2 border-[var(--ink)] bg-[var(--sky)] px-7 py-3 text-sm font-extrabold shadow-[3px_3px_0_var(--ink)] transition hover:-translate-y-0.5"
            >
              Start playing
            </Link>
            <Link
              href="/stories"
              className="rounded-xl border-2 border-[var(--ink)] bg-[var(--lavender)] px-7 py-3 text-sm font-extrabold shadow-[3px_3px_0_var(--ink)] transition hover:-translate-y-0.5"
            >
              Explore stories
            </Link>
          </div>
        </div>

        <a href="#about" className="group mt-16 flex flex-col items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--ink)]/55">
          About the project
          <span className="text-3xl leading-none transition group-hover:translate-y-1">↓</span>
        </a>
      </section>

      <section id="about" className="relative z-10 bg-[var(--cream)] px-6 pb-24 pt-16">
        <div className="mx-auto grid w-[min(100%,980px)] gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[var(--ink)]/45">
              About the project
            </p>
            <h2 className="font-display mt-4 text-5xl font-medium leading-[0.95] tracking-[-0.045em] md:text-7xl">
              A campus is not neutral ground.
            </h2>
          </div>

          <div className="space-y-5 text-lg font-medium leading-relaxed text-[var(--ink)]/72">
            <p>
              This project uses Snakes and Ladders to explore the built environment of the Colby
              College campus. Paths, setbacks, lifts, stairs, construction, and snow become a way
              to hold collective memory.
            </p>
            <p>
              The goal is to trace how getting through campus changes with season, policy,
              maintenance, weather, and who gets spared detours, or sent on them, when things break down.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Ramps', 'moments that move you forward'],
                ['Slides', 'barriers that send you back'],
                ['No-go', 'places that block the route'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border-2 border-[var(--ink)] bg-[var(--cream-card)] p-4 shadow-[3px_3px_0_var(--ink)]">
                  <h3 className="text-base font-extrabold">{title}</h3>
                  <p className="mt-2 text-sm leading-snug text-[var(--ink)]/60">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
