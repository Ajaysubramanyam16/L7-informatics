import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { getChatResponse } from '../services/geminiService';
import { Send, Bot, User, Loader2, Sparkles, MessageSquare } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatBot: React.FC = () => {
  const { expenses, budgets } = useFinance();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm your SpendSmart AI assistant. I can help you analyze your spending, check your budgets, or find specific transactions. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const context = {
        expenses: expenses.slice(0, 100),
        budgets: budgets
      };

      const history = messages.slice(1); 
      
      const responseText = await getChatResponse(history, userMessage, context);
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col h-[80vh] overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-white flex items-center gap-4 z-10 shadow-sm">
        <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md shadow-indigo-500/20">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-lg leading-tight">AI Assistant</h2>
          <p className="text-xs text-indigo-500 font-medium flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
             Online • Gemini Powered
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 scroll-smooth">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-slate-800' 
                : 'bg-indigo-100 border border-indigo-200'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-indigo-600" />}
            </div>
            
            <div className={`max-w-[85%] px-5 py-3.5 text-sm leading-relaxed shadow-sm relative ${
              msg.role === 'user' 
                ? 'bg-slate-800 text-white rounded-2xl rounded-tr-sm' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-sm'
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
               <div className="flex gap-1">
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-0"></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
               </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="flex gap-3 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about spending, budgets, or specific purchases..."
            className="flex-1 border border-slate-200 bg-slate-50 rounded-xl pl-5 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="p-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition-all shadow-md shadow-slate-900/20 active:scale-95"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-3">
           AI can make mistakes. Please verify important financial details.
        </p>
      </div>
    </div>
  );
};

export default ChatBot;