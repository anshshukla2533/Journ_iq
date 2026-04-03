import React, { useEffect, useRef, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import aiService from '../../services/aiService';

export default function JournAIAssistant() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Ask anything about studying, notes, writing, or ideas. I am ready.',
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  const handleSend = async () => {
    const trimmed = question.trim();
    if (!trimmed || !token || isSending) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setError('');
    setIsSending(true);

    try {
      const response = await aiService.sendMessage(trimmed, token);
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: response?.reply || 'No reply generated.',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (sendError) {
      setError('JournAI is unavailable right now. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#b88455_0%,#8a9a5b_100%)] text-white shadow-[0_18px_45px_rgba(122,92,56,0.28)] transition hover:scale-[1.03] lg:bottom-8 lg:right-8"
        aria-label="Open JournAI"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.657-5.657 1.414-1.414M4.929 19.071l1.414-1.414m12.728 1.414-1.414-1.414M6.343 6.343 4.929 4.929M8.5 9.5h7v5h-7z" />
        </svg>
      </button>

      {isOpen ? (
        <div className="fixed bottom-24 right-4 z-40 w-[calc(100vw-2rem)] max-w-[380px] rounded-[1.75rem] border border-[#eadfce] bg-[linear-gradient(180deg,#fffefb_0%,#f7f0e5_100%)] shadow-[0_22px_60px_rgba(122,92,56,0.22)] backdrop-blur-xl lg:bottom-28 lg:right-8">
          <div className="flex items-start justify-between gap-4 border-b border-[#eadfce] px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a2805c]">JournAI</p>
              <h3 className="mt-1 font-['Sora'] text-xl font-semibold text-[#2f2720]">Ask anything</h3>
              <p className="mt-1 text-sm text-[#786d62]">Gemini-powered study companion</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-[#e5d8c6] px-3 py-1 text-xs font-semibold text-[#8d6948] transition hover:border-[#c49a6c]"
            >
              Close
            </button>
          </div>

          <div ref={scrollRef} className="max-h-[360px] space-y-3 overflow-y-auto px-5 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[88%] rounded-[1.25rem] px-4 py-3 text-sm leading-7 shadow-sm ${
                  message.role === 'user'
                    ? 'ml-auto bg-[#b88455] text-white'
                    : 'bg-white/90 text-[#3c3229]'
                }`}
              >
                {message.text}
              </div>
            ))}
            {isSending ? (
              <div className="max-w-[88%] rounded-[1.25rem] bg-white/90 px-4 py-3 text-sm text-[#6f6459] shadow-sm">
                Thinking...
              </div>
            ) : null}
          </div>

          <div className="border-t border-[#eadfce] px-5 py-4">
            {error ? (
              <div className="mb-3 rounded-2xl border border-[#f0d4d4] bg-[#fff5f5] px-4 py-3 text-sm text-[#a35d5d]">
                {error}
              </div>
            ) : null}

            <div className="flex gap-3">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask JournAI anything..."
                className="min-h-[88px] flex-1 rounded-[1.25rem] border border-[#e7dac7] bg-white/90 px-4 py-3 text-sm leading-7 text-[#2f2720] outline-none transition focus:border-[#c49a6c] focus:ring-4 focus:ring-[#c49a6c]/15"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!question.trim() || isSending}
                className="self-end rounded-2xl bg-[#7f9a5c] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(127,154,92,0.24)] transition hover:bg-[#718c4f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
