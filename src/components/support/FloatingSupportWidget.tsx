import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Phone, Mail, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/support-chat`;

const QUICK_QUESTIONS = [
  "How do I pay fees?",
  "Payment failed, help!",
  "Can't log in",
  "Register my school",
];

const FloatingSupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "👋 Hi! I'm **EduPay AI Assistant**. I can help you with fee payments, login issues, school registration, and more.\n\nHow can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        content: text,
        role: "user",
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInputValue("");
      setIsStreaming(true);

      let assistantContent = "";

      const upsertAssistant = (chunk: string) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id.startsWith("stream-")) {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          return [
            ...prev,
            {
              id: `stream-${Date.now()}`,
              content: assistantContent,
              role: "assistant" as const,
              timestamp: new Date(),
            },
          ];
        });
      };

      try {
        const apiMessages = updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: apiMessages }),
        });

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error || `Error ${resp.status}`);
        }

        if (!resp.body) throw new Error("No stream body");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) upsertAssistant(content);
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        // Flush remaining
        if (textBuffer.trim()) {
          for (let raw of textBuffer.split("\n")) {
            if (!raw) continue;
            if (raw.endsWith("\r")) raw = raw.slice(0, -1);
            if (!raw.startsWith("data: ")) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) upsertAssistant(content);
            } catch { /* ignore */ }
          }
        }
      } catch (e: any) {
        console.error("Chat error:", e);
        const fallback = `I'm having trouble connecting right now. Please try again or contact us directly:\n\n📞 **Call**: +91 9708565215\n📧 **Email**: aradhayrajbusiness@gmail.com`;
        upsertAssistant(fallback);
        toast({
          title: "Connection issue",
          description: e.message || "Could not reach AI support",
          variant: "destructive",
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming, toast]
  );

  const handleSend = () => sendMessage(inputValue);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
           className="relative w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg flex items-center justify-center text-white"
           aria-label="Open support chat"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </motion.button>

        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/30 pointer-events-none"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-[9998] w-[380px] max-w-[calc(100vw-3rem)] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: "min(550px, calc(100vh - 8rem))" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-accent p-4 text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-1.5">
                    EduPay AI Support
                  </h3>
                  <p className="text-xs text-white/80">Powered by AI • Available 24/7</p>
                </div>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="p-2.5 bg-secondary/50 border-b border-border flex gap-2 flex-shrink-0">
              <a
                href="tel:+919708565215"
                className="flex-1 flex items-center justify-center gap-2 p-2 bg-background rounded-lg hover:bg-primary/10 transition-colors text-sm"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">9708565215</span>
              </a>
              <a
                href="mailto:aradhayrajbusiness@gmail.com"
                className="flex-1 flex items-center justify-center gap-2 p-2 bg-background rounded-lg hover:bg-primary/10 transition-colors text-sm"
              >
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">Email Us</span>
              </a>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        message.role === "assistant"
                          ? "bg-secondary text-foreground rounded-tl-none"
                          : "bg-primary text-primary-foreground rounded-tr-none"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === "assistant" && (
                          <Bot className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                        )}
                        <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-1">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                        {message.role === "user" && (
                          <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-secondary p-3 rounded-2xl rounded-tl-none">
                      <div className="flex gap-1">
                        <motion.span
                          className="w-2 h-2 bg-muted-foreground rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                        />
                        <motion.span
                          className="w-2 h-2 bg-muted-foreground rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                        />
                        <motion.span
                          className="w-2 h-2 bg-muted-foreground rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Quick Questions (only show at start) */}
              {messages.length <= 1 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Quick questions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="text-xs px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isStreaming}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isStreaming}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                AI-powered • 📞 9708565215 • 📧 aradhayrajbusiness@gmail.com
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingSupportWidget;
