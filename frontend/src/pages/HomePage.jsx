import React from 'react';

const productPillars = [
  {
    title: 'Watch and capture',
    description: 'Take live notes while studying from videos and keep every insight tied to the source.',
    accent: 'bg-[#fff1df] text-[#b88455]',
    border: 'border-[#eadfce]',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Think in notes',
    description: 'Organize ideas, timestamps, and summaries in a workspace that stays calm and searchable.',
    accent: 'bg-[#eef7ea] text-[#7f9a5c]',
    border: 'border-[#dbe6cf]',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    title: 'Share and discuss',
    description: 'Send notes to friends, continue inside chat, and keep discussions attached to the work.',
    accent: 'bg-[#f1ebff] text-[#8b63f0]',
    border: 'border-[#e6ddfb]',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: 'Stay updated',
    description: 'Read relevant news, manage tasks, and keep your learning rhythm in one place.',
    accent: 'bg-[#fff3e6] text-[#df7f29]',
    border: 'border-[#f0dfc9]',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#eadfce] bg-[linear-gradient(135deg,#fffefb_0%,#f6eee1_50%,#f7f1e7_100%)] p-8 shadow-[0_24px_70px_rgba(122,92,56,0.1)] lg:p-10">
        <div className="absolute -left-8 top-10 h-36 w-36 rounded-full bg-[#d9b88c]/18 blur-3xl" />
        <div className="absolute bottom-0 right-8 h-40 w-40 rounded-full bg-[#b7c39a]/16 blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_420px]">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-[#dfc7a8] bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#9b7651]">
              Intelligent Study Workspace
            </span>
            <h1 className="mt-5 font-['Sora'] text-5xl font-semibold leading-[0.98] text-[#2f2720] md:text-6xl xl:text-7xl">
              JournIQ helps you
              <br />
              learn with less noise
              <br />
              and more clarity.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6f655b]">
              Watch, write, ask, share, and return to one calm system that keeps your study flow organized from first idea to final discussion.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-full border border-[#eadfce] bg-white/80 px-4 py-2 text-sm font-medium text-[#64594f]">
                Live video notes
              </div>
              <div className="rounded-full border border-[#eadfce] bg-white/80 px-4 py-2 text-sm font-medium text-[#64594f]">
                AI doubt solver
              </div>
              <div className="rounded-full border border-[#eadfce] bg-white/80 px-4 py-2 text-sm font-medium text-[#64594f]">
                Note-linked chat
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-[#eadfce] bg-white/75 p-5 shadow-[0_12px_30px_rgba(122,92,56,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a2805c]">Flow</p>
                <p className="mt-3 text-2xl font-semibold text-[#2f2720]">Watch</p>
                <p className="mt-2 text-sm leading-6 text-[#7c7165]">Study from video without breaking focus.</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#eadfce] bg-white/75 p-5 shadow-[0_12px_30px_rgba(122,92,56,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a2805c]">Flow</p>
                <p className="mt-3 text-2xl font-semibold text-[#2f2720]">Write</p>
                <p className="mt-2 text-sm leading-6 text-[#7c7165]">Capture notes with clean structure and context.</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#eadfce] bg-white/75 p-5 shadow-[0_12px_30px_rgba(122,92,56,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a2805c]">Flow</p>
                <p className="mt-3 text-2xl font-semibold text-[#2f2720]">Share</p>
                <p className="mt-2 text-sm leading-6 text-[#7c7165]">Turn a note into a conversation instantly.</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.8rem] border border-[#eadfce] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e6_100%)] p-6 shadow-[0_20px_50px_rgba(122,92,56,0.08)]">
            <div className="absolute inset-x-10 top-5 h-px bg-[linear-gradient(90deg,transparent,rgba(184,132,85,0.35),transparent)]" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a2805c]">Today's Pulse</p>
                <h2 className="mt-2 font-['Sora'] text-3xl font-semibold text-[#2f2720]">Live Workspace</h2>
              </div>
              <div className="rounded-full bg-[#eef7ea] px-3 py-2 text-xs font-semibold text-[#6f8a50]">
                Active
              </div>
            </div>

            <div className="relative mt-8 flex min-h-[480px] items-center justify-center">
              <div className="absolute left-8 top-10 h-24 w-24 rounded-full bg-[#d9b88c]/20 blur-3xl" />
              <div className="absolute bottom-10 right-8 h-28 w-28 rounded-full bg-[#b7c39a]/18 blur-3xl" />

              <div className="journiq-orbit-scene">
                <div className="journiq-orbit-ring journiq-orbit-ring--outer" />
                <div className="journiq-orbit-ring journiq-orbit-ring--inner" />

                <div className="journiq-floating-card journiq-floating-card--notes">
                  <div className="journiq-card-icon bg-[#fff1df] text-[#b88455]">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <p className="journiq-card-kicker">Notes</p>
                  <h3>Clean capture</h3>
                  <p>Autosaving structure for focused study.</p>
                </div>

                <div className="journiq-floating-card journiq-floating-card--chat">
                  <div className="journiq-card-icon bg-[#eef7ea] text-[#7f9a5c]">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
                    </svg>
                  </div>
                  <p className="journiq-card-kicker">Chat</p>
                  <h3>Note-first</h3>
                  <p>Discuss ideas right where they were created.</p>
                </div>

                <div className="journiq-floating-card journiq-floating-card--ai">
                  <div className="journiq-card-icon bg-[#f1ebff] text-[#8b63f0]">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="journiq-card-kicker">AI</p>
                  <h3>Quick help</h3>
                  <p>Answers stay close, never louder than the work.</p>
                </div>

                <div className="journiq-core-panel">
                  <div className="journiq-core-badge">JournIQ</div>
                  <div className="journiq-core-screen">
                    <div className="journiq-core-line journiq-core-line--wide" />
                    <div className="journiq-core-line journiq-core-line--mid" />
                    <div className="journiq-core-line journiq-core-line--short" />
                    <div className="journiq-core-wave">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                  <div className="journiq-core-shadow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {productPillars.map((item) => (
          <article
            key={item.title}
            className={`rounded-[1.6rem] border ${item.border} bg-white/78 p-6 shadow-[0_16px_36px_rgba(122,92,56,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(122,92,56,0.1)]`}
          >
            <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${item.accent}`}>
              {item.icon}
            </div>
            <h3 className="font-['Sora'] text-xl font-semibold text-[#2f2720]">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[#756a60]">{item.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
