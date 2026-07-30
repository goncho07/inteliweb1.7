import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Loader2, Send } from 'lucide-react';
import type { ChatMessage } from '@/types';
import { sendMessageToAI } from '@/services/geminiService';

export const AIChatPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'ai', text: "Bienvenida Lisha. Soy Peepos AI. ¿Deseas generar un reporte financiero o inscribir un nuevo alumno?" }]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!input.trim()) return;
    
    const userMsg = input; 
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]); 
    setInput(''); 
    setLoading(true);
    
    try {
      const responseText = await sendMessageToAI(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
    } catch { 
      setMessages(prev => [...prev, { role: 'ai', text: "Error de red." }]); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <AnimatePresence>{isOpen && (
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="absolute bottom-8 right-8 w-[350px] bg-white dark:bg-slate-900 rounded-[36px] shadow-2xl border border-gray-100 dark:border-slate-800 z-50 overflow-hidden flex flex-col h-[520px]">
        <div className="bg-blue-600 p-6 flex justify-between items-center text-white shrink-0 shadow-lg relative"><div className="flex items-center gap-3"><div className="p-2 bg-white/20 rounded-xl backdrop-blur-md"><Bot size={22}/></div><div><p className="font-bold text-sm leading-none">Peepos AI</p><p className="text-[10px] text-blue-100 font-bold uppercase tracking-widest mt-1">Inteligencia Administrativa</p></div></div><button onClick={onClose}><X size={20}/></button></div>
        <div className="p-6 flex-1 overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-slate-800/50 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-4 text-xs font-medium leading-relaxed rounded-xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-tl-none'}`}>{m.text}</div></div>
          ))}
          {loading && <Loader2 size={18} className="animate-spin text-blue-600 mx-auto" />}<div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="p-5 bg-white dark:bg-slate-900 border-t dark:border-slate-800 flex gap-3 shrink-0"><input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-xl px-5 py-4 text-xs font-semibold outline-none" placeholder="Hazme una pregunta..." /><button type="submit" className="p-4 bg-blue-600 text-white rounded-xl"><Send size={20}/></button></form>
      </motion.div>
    )}</AnimatePresence>
  );
};
