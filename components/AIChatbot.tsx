
import React, { useState, useRef, useEffect } from 'react';
import { safariAI } from '../services/gemini';
import { Message } from '../types';
import { Send, Mic, X, Bot, User, Loader2 } from 'lucide-react';

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ isOpen, onClose, initialPrompt }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Jambo! I'm your Venture Safaris AI Concierge. Ready to plan your dream East African escape? Tell me where you'd like to go or what you'd like to see.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSend(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  const handleSend = async (textToSubmit?: string) => {
    const text = textToSubmit || input;
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const aiResponseText = await safariAI.getResponse(text);
    const aiMessage: Message = { role: 'model', text: aiResponseText, timestamp: new Date() };
    
    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };
    recognition.start();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm sm:items-end sm:justify-end">
      <div className="bg-white w-full max-w-[435px] h-[75vh] sm:h-[525px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="bg-emerald-900 p-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-bold">AI Concierge</h3>
              <p className="text-xs text-emerald-200">Always active for you</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Chat Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === 'user' ? 'bg-emerald-700 text-white rounded-tr-none' : 'bg-white text-stone-700 rounded-tl-none border border-stone-200'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-2">
                <Loader2 className="animate-spin text-emerald-600" size={16} />
                <span className="text-xs text-stone-500">Concierge is typing...</span>
              </div>
            </div>
          )}
          
          {!isTyping && messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pt-2">
              <button onClick={() => handleSend("What activities do you offer?")} className="bg-white border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-emerald-50 transition-colors shadow-sm">🎯 Activities</button>
              <button onClick={() => handleSend("Tell me about prices")} className="bg-white border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-emerald-50 transition-colors shadow-sm">💰 Prices</button>
              <button onClick={() => handleSend("Make me a 5-day itinerary for Uganda")} className="bg-white border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-emerald-50 transition-colors shadow-sm">🗺️ Itinerary</button>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-stone-100 flex gap-2 shrink-0">
          <button 
            onClick={startListening}
            className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
          >
            <Mic size={20} />
          </button>
          <input 
            type="text" 
            placeholder="Plan my safari..."
            className="flex-1 bg-stone-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-3 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-lg shadow-emerald-700/20"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
