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
          <div className={`max-w-[85%] ${me ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 shadow-sm'} rounded-2xl overflow-hidden`}>
            <div className="p-4 space-y-3">
              {normalized.content.map((chunk, i) => (
                i % 2 === 0 ? (
                  <div key={`t-${i}`} className={`text-sm leading-relaxed font-medium ${me ? 'text-white' : 'text-gray-800'}`}>
                    {chunk}
                  </div>
                ) : (
                  <div key={`c-${i}`} className="relative group">
                    <pre className="text-xs leading-relaxed overflow-x-auto p-4 rounded-lg bg-gray-900 text-gray-100 font-mono border border-gray-700 shadow-sm">
{chunk}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(chunk, `${index}-${i}`)}
                      className="absolute top-3 right-3 p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy code"
                    >
                      {copiedIndex === `${index}-${i}` ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-gray-300" />
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
        <div className={`max-w-[85%] rounded-2xl shadow-md p-4 ${
          me 
            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' 
            : 'bg-white border border-gray-200 text-gray-800'
        }`}>
          <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.content}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-6 bottom-20 z-30 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-full shadow-lg hover:shadow-2xl transition-all duration-200 flex items-center gap-2.5 group hover:scale-110"
        >
          <span className="text-xl group-hover:rotate-12 transition-transform duration-300">✨</span>
          <span>Luna</span>
        </button>
      )}

      {isOpen && (
        <div className="w-[420px] max-w-[95vw] bg-gradient-to-b from-gray-50 to-gray-100 border-l border-gray-200 h-screen flex flex-col fixed right-0 top-0 z-40 shadow-2xl">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-blue-100 flex items-center justify-center font-bold text-lg border border-white/30 shadow-lg">
                  <span className="bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">✨</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Luna</h2>
                  <p className="text-xs text-blue-100 mt-0.5 font-medium">AI Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200 hover:scale-110" 
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4 max-w-sm px-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-4xl">✨</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to Luna</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Your intelligent AI assistant. Ask questions, get code snippets, brainstorm ideas, and more!
                    </p>
                  </div>
                  <div className="pt-2 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Try asking:</p>
                    <div className="space-y-2">
                      <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors">💡 "Explain React hooks"</div>
                      <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors">📝 "Write a function to sort an array"</div>
                      <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors">🎨 "Design tips for UI"</div>
                    </div>
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
                  placeholder="Ask me anything..."
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-2xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-blue-600 focus:bg-white transition-all text-sm font-medium"
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className="px-4 py-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center gap-2 font-semibold text-sm hover:scale-105 duration-200"
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