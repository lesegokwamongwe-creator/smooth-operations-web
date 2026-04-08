import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Info } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: 'model',
  text: "Hello! I'm your Smooth Operations Financial Coach. I'm here to help you understand budgeting, managing debt, improving your credit score, and making smart financial decisions. How can I help you today?",
};

export default function FinancialCoach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history if user is logged in
  useEffect(() => {
    if (!user) {
      setMessages([INITIAL_MESSAGE]);
      return;
    }

    const q = query(
      collection(db, `users/${user.uid}/chatMessages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setMessages([INITIAL_MESSAGE]);
        return;
      }

      const loadedMessages: Message[] = snapshot.docs.map(doc => ({
        id: doc.id,
        role: doc.data().role,
        text: doc.data().text,
      }));
      
      // Ensure the initial greeting is always at the top if it's not saved
      if (loadedMessages.length === 0 || loadedMessages[0].text !== INITIAL_MESSAGE.text) {
         setMessages([INITIAL_MESSAGE, ...loadedMessages]);
      } else {
         setMessages(loadedMessages);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/chatMessages`);
    });

    return () => unsubscribe();
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveMessageToFirestore = async (role: 'user' | 'model', text: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/chatMessages`), {
        role,
        text,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/chatMessages`);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
    };
    
    // If not logged in, update local state immediately
    if (!user) {
      setMessages((prev) => [...prev, newUserMessage]);
    } else {
      // If logged in, save to Firestore (onSnapshot will update the UI)
      // We also optimistically update to avoid lag
      setMessages((prev) => [...prev, newUserMessage]);
      await saveMessageToFirestore('user', userText);
    }
    
    setIsLoading(true);

    try {
      // Initialize Gemini API
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // We need to pass the conversation history
      const contents = messages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));
      
      // Add the new user message
      contents.push({
        role: 'user',
        parts: [{ text: userText }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contents as any,
        config: {
          systemInstruction: "You are a helpful, empathetic, and knowledgeable financial literacy coach for Smooth Operations, a South African personal loan provider. Your goal is to help users understand budgeting, saving, managing debt, improving credit scores, and responsible borrowing. Keep your answers concise, practical, encouraging, and easy to understand. Use South African context (e.g., Rands, NCR, credit bureaus like TransUnion/Experian) where appropriate. Do not give specific investment advice (like telling them which stocks to buy), but rather focus on financial education and literacy. Format your responses using Markdown.",
          temperature: 0.7,
        }
      });

      const text = response.text || "I'm sorry, I couldn't process that request right now. Please try again.";
      
      if (!user) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: text,
          },
        ]);
      } else {
        await saveMessageToFirestore('model', text);
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorText = "I'm sorry, I'm having trouble connecting right now. Please try again later.";
      if (!user) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: errorText,
          },
        ]);
      } else {
        await saveMessageToFirestore('model', errorText);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Financial Literacy Coach</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Get personalized guidance on budgeting, saving, and managing your debt responsibly.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-4 flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Smooth Operations Coach</h2>
            <p className="text-emerald-100 text-sm">AI Financial Assistant</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            This coach provides general financial education, not professional financial advice. For specific financial planning, please consult a registered financial advisor.
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4 max-w-[85%]",
                message.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div
                className={cn(
                  "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  message.role === 'user' ? "bg-emerald-100" : "bg-emerald-600"
                )}
              >
                {message.role === 'user' ? (
                  <User className="w-5 h-5 text-emerald-700" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              <div
                className={cn(
                  "rounded-2xl px-5 py-3.5 shadow-sm",
                  message.role === 'user'
                    ? "bg-emerald-600 text-white rounded-tr-none"
                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                )}
              >
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{message.text}</p>
                ) : (
                  <div className="markdown-body prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-100 prose-pre:text-slate-800">
                    <Markdown>{message.text}</Markdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                <span className="text-sm text-slate-500">Coach is typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about budgeting, credit scores, or managing debt..."
              className="flex-grow px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shrink-0"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
