
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

interface GeminiAssistantProps {
  userType: 'seeker' | 'staff';
}

// Removed: local declare global block which caused duplicate identifier and modifier conflicts with pre-existing global types.

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ userType }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fix: Scrolled chat to bottom when new messages arrive.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    const userMsg = input.trim();
    if (!userMsg || isLoading) return;

    // Reset input immediately for responsive UX
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Fix: Create a new GoogleGenAI instance right before making an API call to ensure it uses the most up-to-date API key from the environment.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = userType === 'seeker' 
        ? `You are "ReliefTrack AI", a compassionate relief coordinator. 
           Help with: 1. Cooking tips for rations (rice, wheat, oil). 2. Safe storage. 3. Support.
           Keep responses concise, warm, and practical.`
        : `You are "ReliefTrack Logistics Advisor" for staff. 
           Help with: 1. Queue management. 2. Dispute resolution. 3. FIFO inventory.
           Be direct, professional, and data-driven.`;

      // Fix: Use the gemini-3-flash-preview model for general assistant tasks as per instructions.
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction,
          temperature: 0.7,
        },
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      });

      const response = await chat.sendMessage({ message: userMsg });
      
      // Fix: Directly accessed the .text property on GenerateContentResponse as it is not a method.
     const modelReply = response?.text ?? "⚠️ No response generated.";

setMessages(prev => [
  ...prev,
  { role: 'model', text: modelReply }
]);
    } catch (err: any) {
      console.error("Gemini Assistant Failure:", err);
      // Fix: Graceful error message for the user when the API call fails.
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "The logistics network is experiencing high latency. Please try your request again shortly." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col h-[600px] overflow-hidden">
      <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <i className="fas fa-microchip text-xl"></i>
          </div>
          <div>
            <h3 className="font-black text-sm tracking-tight leading-none mb-1">ReliefTrack AI</h3>
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Active Intelligence</span>
            </div>
          </div>
        </div>
        <button 
            onClick={() => setMessages([])}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"
        >
            <i className="fas fa-trash-can text-xs"></i>
        </button>
      </div>

      <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-6 bg-[#fcfdfe]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in duration-700">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-200">
                <i className="fas fa-comments text-4xl"></i>
            </div>
            <div className="max-w-xs space-y-2">
                <p className="text-slate-900 font-black">Ready to Assist</p>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">Ask about storage, logistics strategies, or general support.</p>
            </div>
          </div>
        )}
        
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
              m.role === 'user' 
              ? 'bg-blue-600 text-white rounded-tr-none font-medium' 
              : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none font-medium'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-white border border-slate-100 text-slate-400 rounded-2xl rounded-tl-none p-4 text-xs flex gap-1.5 items-center font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span className="ml-1">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="flex gap-3 items-center">
          <input 
            className="flex-grow px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-50/50 focus:border-blue-400 outline-none text-sm font-medium transition-all"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-blue-200 active:scale-95 shrink-0"
          >
            <i className="fas fa-paper-plane text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
