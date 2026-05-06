import Link from 'next/link';
import { EB_Garamond, Figtree } from 'next/font/google';

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const navItems = ['The game', 'Stories', 'About', 'Customize'];

export default function FrontDoorConceptPage() {
  return (
    <main
      className={`${figtree.className} relative min-h-screen overflow-hidden bg-[#fbf8df] text-[#161512]`}
    >
      <div className="pointer-events-none absolute -left-40 top-36 h-[520px] w-[520px] rounded-full border border-[#161512]/15" />
      <div className="pointer-events-none absolute -right-28 bottom-10 h-[360px] w-[360px] rounded-full bg-[#dec5f2]/40 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-[76%] h-20 w-[120vw] -translate-x-1/2 -rotate-6 rounded-full bg-[#161512] shadow-2xl" />
      <p className="pointer-events-none absolute left-1/2 top-[76%] w-[140vw] -translate-x-1/2 -rotate-6 whitespace-nowrap text-center text-lg font-semibold tracking-tight text-[#fbf8df]">
        roll the die, find the detour, leave a memory, follow the ramp, tell the story
      </p>

      <header className="relative z-10 mx-auto flex w-[min(92vw,920px)] items-center justify-between rounded-xl border border-[#161512]/15 bg-[#fffbea]/75 px-4 py-2.5 shadow-sm backdrop-blur-md md:mt-5">
        <Link href="/front-door" className="flex items-center gap-2 text-sm font-extrabold">
          <span className="flex h-6 w-6 items-end gap-0.5">
            <span className="h-3 w-1.5 rounded-full bg-[#161512]" />
            <span className="h-5 w-1.5 rounded-full bg-[#161512]" />
            <span className="h-4 w-1.5 rounded-full bg-[#161512]" />
          </span>
          Campus Path
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`} className="hover:opacity-60">
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/play"
            className="hidden rounded-lg border-2 border-[#161512] px-4 py-2 text-sm font-bold shadow-[2px_2px_0_#161512] transition hover:-translate-y-0.5 md:inline-flex"
          >
            Play
          </Link>
          <Link
            href="/stories"
            className="rounded-lg border-2 border-[#161512] bg-[#dec5f2] px-4 py-2 text-sm font-bold shadow-[2px_2px_0_#161512] transition hover:-translate-y-0.5"
          >
            Stories
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] w-[min(92vw,1000px)] flex-col items-center justify-center px-2 pb-24 pt-16 text-center">
        <p className="mb-8 max-w-sm text-sm font-medium leading-relaxed text-[#161512]/60">
          A campus board game about access, detours, care, and the routes people remember.
        </p>

        <h1
          className={`${ebGaramond.className} max-w-5xl text-[clamp(4rem,13vw,9.5rem)] font-medium leading-[0.86] tracking-[-0.075em]`}
        >
          <span className="text-[#8e8b80]">Don&apos;t rush,</span>{' '}
          <span className="text-[#161512]">play the path</span>
        </h1>

        <p className="mt-8 max-w-md text-lg font-semibold leading-snug">
          Start with the game, or wander through the notes people left behind on the board.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/play"
            className="rounded-xl border-2 border-[#161512] bg-[#bdefff] px-7 py-3 text-sm font-extrabold shadow-[3px_3px_0_#161512] transition hover:-translate-y-0.5"
          >
            Start playing
          </Link>
          <Link
            href="/stories"
            className="rounded-xl border-2 border-[#161512] bg-[#dec5f2] px-7 py-3 text-sm font-extrabold shadow-[3px_3px_0_#161512] transition hover:-translate-y-0.5"
          >
            Explore stories
          </Link>
        </div>

        <a href="#about" className="group mt-16 flex flex-col items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#161512]/55">
          About the project
          <span className="text-3xl leading-none transition group-hover:translate-y-1">↓</span>
        </a>

        <div className="pointer-events-none absolute left-0 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rotate-[64deg] text-left text-sm font-medium leading-relaxed text-[#161512]/30 md:block">
          <p>someone took the long way after the snow</p>
          <p>someone found the open door</p>
          <p>someone waited for the elevator again</p>
        </div>

        <div className="pointer-events-none absolute bottom-16 right-10 hidden rounded-full border-2 border-[#161512] bg-[#fffbea] px-7 py-4 shadow-[4px_4px_0_#161512] md:block">
          <div className="flex h-10 items-center gap-1">
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-[#161512]"
                style={{ height: `${12 + ((i * 7) % 26)}px` }}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="relative z-10 bg-[#fbf8df] px-6 pb-24 pt-16">
        <div className="mx-auto grid w-[min(100%,980px)] gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#161512]/45">
              About the project
            </p>
            <h2 className={`${ebGaramond.className} mt-4 text-5xl font-medium leading-[0.95] tracking-[-0.045em] md:text-7xl`}>
              A campus is not neutral ground.
            </h2>
          </div>

          <div className="space-y-5 text-lg font-medium leading-relaxed text-[#161512]/72">
            <p>
              This project turns Snakes and Ladders into a playful way to notice how campus infrastructure
              changes movement. Ramps, slides, blocked squares, and notes become a shared map of everyday access.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Ramps', 'moments that move you forward'],
                ['Slides', 'barriers that send you back'],
                ['No-go', 'places that block the route'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border-2 border-[#161512] bg-[#fffbea] p-4 shadow-[3px_3px_0_#161512]">
                  <h3 className="text-base font-extrabold">{title}</h3>
                  <p className="mt-2 text-sm leading-snug text-[#161512]/60">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
