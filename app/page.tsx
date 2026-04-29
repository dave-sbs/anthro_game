import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#213329] text-white flex flex-col">
      <article className="flex-1 max-w-2xl mx-auto px-6 py-14 md:py-20">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-8">
          A campus isn’t neutral ground
        </h1>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-5 text-lg text-white/72 leading-relaxed">
          <p>
            This project uses the board game Snakes and Ladders to explore the built environment of the Colby College campus. Paths, setbacks, lifts, stairs, construction, snow—as a way to
            hold collective memory. Each square stands for somewhere on campus. Slides represent the kinds of barriers people actually hit like ice, broken elevators, unclear routes. Ladders are the rare moments infrastructure works in your favor like an open door, a cleared ramp, a shuttle that waits for you.
          </p>
          <p>
            The goal is not to simulate a fantasy race. It is to trace how{' '}
            <span className="text-white font-medium">getting through campus</span> changes with season,
            policy, maintenance, weather, and who gets spared detours, or sent on them, when things break down.
          </p>
          <p>
            We invite whoever plays to attach short notes at specific places: a story, an observation, a day that
            went sideways. Together those notes sketch a geography of experience, little trinkets of evidence
            of how the built environment behaves toward real bodies moving through it.
          </p>
        </div>

        <nav className="mt-12 flex flex-col sm:flex-row gap-3">
          <Link
            href="/play"
            className="inline-flex justify-center px-5 py-2.5 rounded-full bg-[#f5e9c8] text-[#213329] text-md font-semibold hover:brightness-95 transition"
          >
            Enter the campus path
          </Link>
          <Link
            href="/stories"
            className="inline-flex justify-center px-5 py-2.5 rounded-full border border-white/40 text-white text-md font-semibold hover:bg-white/10 transition"
          >
            Browse people’s stories
          </Link>
        </nav>
      </article>
    </main>
  );
}
