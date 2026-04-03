import React from 'react';

const ChatWelcome = () => {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center bg-[linear-gradient(135deg,#fffdf8_0%,#f6efe2_55%,#f3ebde_100%)] p-8">
      <div className="relative mb-8">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-[0_18px_50px_rgba(122,92,56,0.12)]">
          <svg className="h-16 w-16 text-[#b88455]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#eef7ea]">
          <svg className="h-5 w-5 text-[#7f9a5c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      </div>

      <h1 className="mb-3 font-['Sora'] text-2xl font-semibold text-[#2f2720]">Welcome to JournIQ Chat</h1>

      <div className="max-w-md space-y-4 text-center">
        <p className="text-[#6b6258]">
          Select a friend from the sidebar to start a conversation. Share notes, discuss what you watched, and keep your collaboration clear.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-2xl border border-[#eadfce] bg-white/80 p-4">
            <div className="mb-2 text-[#b88455]">
              <svg className="mx-auto h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="mb-1 font-medium text-[#2f2720]">Real-time Chat</h3>
            <p className="text-[#73685d]">Instant messaging that stays study-focused</p>
          </div>

          <div className="rounded-2xl border border-[#dbe6cf] bg-[#f5faef] p-4">
            <div className="mb-2 text-[#7f9a5c]">
              <svg className="mx-auto h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mb-1 font-medium text-[#2f2720]">Study Sharing</h3>
            <p className="text-[#73685d]">Turn a saved note into a conversation instantly</p>
          </div>

          <div className="rounded-2xl border border-[#eadfce] bg-white/80 p-4">
            <div className="mb-2 text-[#8d6948]">
              <svg className="mx-auto h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mb-1 font-medium text-[#2f2720]">Shared Notes</h3>
            <p className="text-[#73685d]">Keep context attached while you discuss ideas</p>
          </div>

          <div className="rounded-2xl border border-[#f0e2c9] bg-[#fff7ea] p-4">
            <div className="mb-2 text-[#c08b3f]">
              <svg className="mx-auto h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828 2.828a9 9 0 001.414 1.414" />
              </svg>
            </div>
            <h3 className="mb-1 font-medium text-[#2f2720]">Clean Workflow</h3>
            <p className="text-[#73685d]">A calmer interface that keeps attention on the exchange</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWelcome;
