import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Phone, Mail, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    text: "👋 Hi! I'm EduPay Assistant. How can I help you today?",
    isBot: true,
    timestamp: new Date(),
  },
];

const BOT_RESPONSES: Record<string, string> = {
  fee: "To pay fees, log in to your parent dashboard, select the pending fee, and click 'Pay Now'. You can pay via UPI apps like GPay, PhonePe, or Paytm.",
  payment: "Payment issues? Make sure your UPI app is updated. If payment failed, wait 30 mins for auto-refund. For manual help, contact us at btonot.in@gmail.com",
  login: "Having trouble logging in? Use your registered email and password. Click 'Forgot Password' to reset. Need more help? Call us at 9708565215.",
  school: "Schools can register on EduPay for free! Contact us at btonot.in@gmail.com or call 9708565215 to set up your school.",
  upi: "We support all major UPI apps - Google Pay, PhonePe, Paytm, BHIM, and more. Just scan the QR code or tap your preferred app!",
  receipt: "Payment receipts are automatically generated and available in your dashboard. You can also request a PDF via email.",
  help: "I can help with: fee payments, login issues, UPI payments, receipts, and school registration. What do you need help with?",
  default: "I'm not sure about that. For complex issues, please contact our support team at btonot.in@gmail.com or call 9708565215.",
};

const FloatingSupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    
    for (const [keyword, response] of Object.entries(BOT_RESPONSES)) {
      if (keyword !== "default" && lowerMsg.includes(keyword)) {
        return response;
      }
    }
    
    if (lowerMsg.includes("hi") || lowerMsg.includes("hello") || lowerMsg.includes("hey")) {
      return "Hello! 👋 How can I assist you with EduPay today?";
    }
    
    if (lowerMsg.includes("thank")) {
      return "You're welcome! 😊 Is there anything else I can help you with?";
    }
    
    return BOT_RESPONSES.default;
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot typing
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg flex items-center justify-center text-white"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <MessageCircle className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Pulse animation */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/30"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[350px] max-w-[calc(100vw-3rem)] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-accent p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">EduPay Support</h3>
                  <p className="text-xs text-white/80">We typically reply instantly</p>
                </div>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="p-3 bg-secondary/50 border-b border-border flex gap-2">
              <a
                href="tel:+919708565215"
                className="flex-1 flex items-center justify-center gap-2 p-2 bg-background rounded-lg hover:bg-primary/10 transition-colors text-sm"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span>Call</span>
              </a>
              <a
                href="mailto:btonot.in@gmail.com"
                className="flex-1 flex items-center justify-center gap-2 p-2 bg-background rounded-lg hover:bg-primary/10 transition-colors text-sm"
              >
                <Mail className="w-4 h-4 text-primary" />
                <span>Email</span>
              </a>
            </div>

            {/* Messages */}
            <div className="h-[300px] overflow-y-auto p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.isBot
                          ? "bg-secondary text-foreground rounded-tl-none"
                          : "bg-primary text-primary-foreground rounded-tr-none"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.isBot && (
                          <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        )}
                        <p className="text-sm">{message.text}</p>
                        {!message.isBot && (
                          <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
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
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Phone: 9708565215 • Email: btonot.in@gmail.com
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingSupportWidget;
