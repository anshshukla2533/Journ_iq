import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Copy, Check } from 'lucide-react';

const ChatbotSidebar = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  // Gemini from env (do not hardcode)
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
          contents: [
            {
              parts: [
                {
                  text: userMessage
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 400
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || `HTTP ${response.status}`);
    }
    if (data?.promptFeedback?.blockReason) {
      throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
    }
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
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${error.message}. Please check your API configuration.`
        }
      ]);
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
        <div key={index} className={`flex ${me ? 'justify-end' : 'justify-start'} mb-4`}>
          <div className={`max-w-[85%] ${me ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' : 'bg-white border border-gray-200'} rounded-2xl shadow-sm overflow-hidden`}>
            <div className="p-4 space-y-3">
              {normalized.content.map((chunk, i) => (
                i % 2 === 0 ? (
                  <div key={`t-${i}`} className={`text-sm leading-relaxed ${me ? 'text-white' : 'text-gray-800'}`}>
                    {chunk}
                  </div>
                ) : (
                  <div key={`c-${i}`} className="relative group">
                    <pre className="text-xs leading-relaxed overflow-x-auto p-4 rounded-lg bg-gray-50 text-gray-800 font-mono border border-gray-200">
{chunk}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(chunk, `${index}-${i}`)}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-white hover:bg-gray-100 border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy code"
                    >
                      {copiedIndex === `${index}-${i}` ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-gray-600" />
                      )}
                    </button>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={index} className={`flex ${me ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[85%] rounded-2xl shadow-sm p-4 ${
          me 
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' 
            : 'bg-white border border-gray-200 text-gray-800'
        }`}>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-6 bottom-20 z-30 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-4 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2.5 group"
        >
          <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Luna</span>
        </button>
      )}

      {isOpen && (
        <div className="w-[420px] max-w-[95vw] bg-gray-50 border-l border-gray-200 h-screen flex flex-col fixed right-0 top-0 z-40 shadow-2xl">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-semibold text-lg border border-white/30">
                  L
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Luna AI Assistant</h2>
                  <p className="text-xs text-blue-100 mt-0.5">Powered by {GEMINI_MODEL}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors" 
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-1">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3 max-w-sm">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Welcome to Luna</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Your intelligent AI assistant powered by Gemini. Ask me anything to get started.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {messages.map((m, i) => renderMessage(m, i))}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-5 bg-white border-t border-gray-200">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative min-w-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all text-sm"
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className="px-5 py-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm flex items-center gap-2 font-medium text-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotSidebar;