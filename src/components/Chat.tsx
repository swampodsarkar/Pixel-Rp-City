import { useState, useEffect, useRef } from "react";
import { ChatMessage, sendChatMessage, listenToMessages } from "../chat";
import { useMultiplayerStore } from "../multiplayer";
import { MessageCircle, Send, X } from "lucide-react";

export const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const players = useMultiplayerStore((s) => s.players);
  const myId = useMultiplayerStore((s) => s.myId);
  const myData = myId ? players[myId] : null;
  const serverId = useMultiplayerStore((s) => s.serverId);

  useEffect(() => {
    const unsub = listenToMessages(setMessages);
    return () => unsub();
  }, [serverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !myId || !myData) return;
    sendChatMessage(myId, myData.name, myData.color, input.trim());
    setInput("");
  };

  // Enter key opens chat, Escape closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !minimized) {
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
        setMinimized(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [minimized]);

  return (
    <div className="absolute bottom-4 left-4 z-20 w-80 pointer-events-none">
      {minimized ? (
        <button
          onClick={() => setMinimized(false)}
          className="pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-3 shadow-2xl hover:bg-black/80 transition-all"
        >
          <MessageCircle size={20} className="text-zinc-300" />
        </button>
      ) : (
        <div className="pointer-events-auto bg-black/70 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Chat
            </span>
            <button onClick={() => setMinimized(true)}>
              <X size={14} className="text-zinc-500 hover:text-white transition-colors" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-48 overflow-y-auto px-3 py-2 space-y-1.5 custom-scrollbar">
            {messages.length === 0 && (
              <p className="text-zinc-600 text-xs italic text-center mt-8">
                No messages yet. Press Enter to chat.
              </p>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm leading-tight break-words">
                <span
                  className="font-bold mr-1.5"
                  style={{ color: msg.senderColor || "#fff" }}
                >
                  {msg.senderName}:
                </span>
                <span className="text-zinc-200">{msg.text}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-white/5 px-3 py-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Type a message..."
              maxLength={200}
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="disabled:opacity-30 disabled:cursor-not-allowed text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
