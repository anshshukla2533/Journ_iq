import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Copy, Check, Sparkles } from 'lucide-react';

const ChatbotSidebar = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBwxoEl30l_IowreNM61xocO194Zi6uZBY';
  const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const callGemini = async (userMessage) => {
    if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured.');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 800 }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || `HTTP ${response.status}`);
    if (data?.promptFeedback?.blockReason) throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    throw new Error('No response generated');
  };

  const normalizeText = (text) => {
    const parts = String(text).split(/```/);
    if (parts.length === 1) return { type: 'text', content: text };
    return { type: 'mixed', content: parts };
  };

  const copyToClipboard = async (str, index) => {
    try {
      await navigator.clipboard.writeText(str);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {}
  };

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    try {
      const aiResponse = await callGemini(userMessage);
      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${error.message}. Please check your API configuration.` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderMessage = (message, index) => {
    const me = message.role === 'user';
    const normalized = normalizeText(message.content);

    if (normalized.type === 'mixed') {
      return (
        <div key={index} className={`flex ${me ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in`}>
          <div className={`max-w-[85%] ${me ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' : 'bg-[#1e2538] border border-white/5 text-gray-200 rounded-2xl rounded-tl-sm'} shadow-lg overflow-hidden`}>
            <div className={`p-4 space-y-3 ${!me && 'border-t-2 border-indigo-500'}`}>
              {normalized.content.map((chunk, i) => (
                i % 2 === 0 ? (
                  <div key={`t-${i}`} className="text-[15px] leading-relaxed whitespace-pre-wrap">
                    {chunk}
                  </div>
                ) : (
                  <div key={`c-${i}`} className="relative group my-3">
                    <div className="absolute top-0 left-0 w-full h-8 bg-[#0a0f1e] rounded-t-xl border-b border-white/10 flex items-center px-4 justify-between">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(chunk, `${index}-${i}`)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Copy code"
                      >
                        {copiedIndex === `${index}-${i}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <pre className="text-sm leading-relaxed overflow-x-auto p-4 pt-10 rounded-xl bg-[#0a0f1e] text-indigo-300 font-mono border border-white/10 custom-scrollbar">
{chunk}
                    </pre>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={index} className={`flex ${me ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in`}>
        <div className={`max-w-[85%] rounded-2xl p-4 shadow-lg ${
          me 
            ? 'bg-indigo-600 text-white rounded-tr-sm' 
            : 'bg-[#1e2538] border border-white/5 text-gray-200 rounded-tl-sm border-t-2 border-indigo-500'
        }`}>
          <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-6 bottom-6 z-50 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium p-4 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`fixed right-0 top-0 h-full w-full sm:w-[500px] max-w-full bg-[#0a0f1e]/95 backdrop-blur-2xl border-l border-white/10 z-50 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide">Luna AI</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <p className="text-xs font-medium text-emerald-400">Powered by Gemini</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors" 
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto animate-fade-in">
              <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping opacity-20"></div>
                <Sparkles className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Hi, I'm Luna</h3>
              <p className="text-gray-400 leading-relaxed text-[15px]">
                Your personal AI assistant. I can help you draft notes, debug code, brainstorm ideas, or process long documents.
              </p>
              
              <div className="mt-10 w-full space-y-3">
                <button onClick={() => setInput("Summarize the key points of...")} className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 text-left text-sm text-gray-300 transition-all group">
                  <span className="text-indigo-400 mr-2 group-hover:ml-1 transition-all">→</span> Summarize a topic
                </button>
                <button onClick={() => setInput("Write a draft for...")} className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 text-left text-sm text-gray-300 transition-all group">
                  <span className="text-indigo-400 mr-2 group-hover:ml-1 transition-all">→</span> Help me write a draft
                </button>
              </div>
            </div>
          )}
          
          {messages.map((m, i) => renderMessage(m, i))}
          
          {loading && (
            <div className="flex justify-start mb-6 animate-fade-in">
              <div className="bg-[#1e2538] border border-white/5 border-t-2 border-indigo-500 rounded-2xl rounded-tl-sm p-5 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        <div className="p-5 bg-[#12182b] border-t border-white/10 shrink-0">
          <div className="relative flex items-end gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-inner">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Luna anything..."
              className="w-full bg-transparent px-3 py-2 text-white placeholder-gray-500 focus:outline-none resize-none min-h-[44px] max-h-32 custom-scrollbar text-[15px]"
              disabled={loading}
              rows={Math.min(4, Math.max(1, input.split('\n').length))}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="w-11 h-11 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
            >
              <Send className="w-5 h-5 ml-[-2px]" />
            </button>
          </div>
          <div className="mt-3 text-center">
            <p className="text-[11px] text-gray-500">Luna can make mistakes. Consider verifying critical information.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatbotSidebar;
