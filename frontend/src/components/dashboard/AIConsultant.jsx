import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  AlertCircle, 
  Stethoscope, 
  History,
  Terminal,
  BrainCircuit
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cn } from "../../lib/utils";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM_PROMPT = `You are "Medico AI", a clinical decision support assistant for healthcare professionals. 
Your goal is to provide:
1. Symptom-to-suggestion mapping based on standard medical guidelines.
2. Specialist recommendations based on history.
3. Quick medical FAQ responses.

IMPORTANT RULES:
- ALWAYS include a major disclaimer: "This tool provides suggestions based on rule sets and AI logic; it is NOT a medical diagnosis and should not replace clinical judgment."
- Keep responses concise, evidence-based, and structured.
- If symptoms are ambiguous, ask clarifying questions instead of jumping to a conclusion.
- For emergency symptoms (e.g. chest pain, stroke signs), immediately advise emergency protocol.
- Do not provide drug dosages.

Role: Assistant for Doctors only.`;

export default function AIConsultant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello Dr., I'm your Clinical Hub AI. How can I assist with symptom analysis or doctor recommendations today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("Gemini API Key missing. Please configure VITE_GEMINI_API_KEY in .env");
      }

      const prompt = `${SYSTEM_PROMPT}\n\nUser: ${userMessage}\nAssistant:`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: "assistant", text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", text: "I encountered an error. Please ensure my API key is configured correctly in the settings. DISCLAIMER: Not a medical diagnosis." }]);
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-6 w-full sm:w-[450px] bg-white rounded-[2.5rem] shadow-[0_30px_90px_rgba(4,64,43,0.2)] border border-primary/10 flex flex-col h-[600px] overflow-hidden"
          >
            <div className="p-6 bg-primary-dark text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="font-black tracking-tight italic">Medico AI Consultant</h3>
                   <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Decision Support Only</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-bg-secondary/30 custom-scrollbar scroll-smooth"
            >
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex flex-col max-w-[85%]",
                  m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                )}>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm font-medium leading-relaxed italic shadow-sm",
                    m.role === "user" 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-white text-primary-dark border border-gray-100 rounded-tl-none"
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 p-4 bg-white/50 rounded-2xl border border-gray-100 w-max italic text-xs text-gray-400">
                   <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                   <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                   <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                   Analyzing clinical rules...
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-gray-100">
               <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Describe symptoms or request recommendation..."
                    className="flex-1 h-14 px-6 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-primary-dark placeholder:italic placeholder:text-gray-300"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                  />
                  <button 
                    onClick={handleSend}
                    disabled={loading}
                    className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
               </div>
               <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-4 text-center">
                  ⚠️ Decision support only. Use professional judgment.
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "h-20 w-20 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-all duration-500",
          isOpen ? "bg-white text-primary-dark rotate-90" : "bg-primary-dark text-white"
        )}
      >
        {isOpen ? <X className="w-8 h-8" /> : <Bot className="w-10 h-10" />}
        {!isOpen && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}
