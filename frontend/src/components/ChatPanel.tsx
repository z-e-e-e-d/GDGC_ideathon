import { useState } from "react";
import { X, Minimize2, Send, Users, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isSelf: boolean;
}

interface Chat {
  id: string;
  name: string;
  type: "team" | "match";
  status?: "pending" | "accepted" | "rejected";
  unread?: number;
  lastMessage?: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
}

const mockChats: Chat[] = [
  { id: "1", name: "FC Lions", type: "team", unread: 3, lastMessage: "Let's meet at 6 PM" },
  { id: "2", name: "Lions vs Eagles", type: "match", status: "accepted", lastMessage: "Match confirmed!" },
  { id: "3", name: "Training Group", type: "team", lastMessage: "Who's coming tomorrow?" },
];

const mockMessages: Message[] = [
  { id: "1", sender: "Ahmed", content: "Hey team, what time should we meet?", timestamp: new Date(), isSelf: false },
  { id: "2", sender: "You", content: "I think 6 PM works best for everyone", timestamp: new Date(), isSelf: true },
  { id: "3", sender: "Youssef", content: "6 PM is good for me 👍", timestamp: new Date(), isSelf: false },
];

const ChatPanel = ({ isOpen, onClose, onMinimize }: ChatPanelProps) => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        sender: "You",
        content: message,
        timestamp: new Date(),
        isSelf: true,
      },
    ]);
    setMessage("");
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "accepted": return "bg-green-500";
      case "rejected": return "bg-red-500";
      case "pending": return "bg-yellow-500";
      default: return "bg-muted";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-card border-l border-border z-50 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg text-foreground">
            {selectedChat ? selectedChat.name : "Chats"}
          </h3>
          {selectedChat?.status && (
            <span className={`w-2 h-2 rounded-full ${getStatusColor(selectedChat.status)}`} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onMinimize}>
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!selectedChat ? (
        // Chat List
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {mockChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className="w-full p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground truncate">{chat.name}</span>
                    {chat.unread && chat.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      ) : (
        // Messages View
        <>
          <Button
            variant="ghost"
            className="m-2 self-start text-muted-foreground"
            onClick={() => setSelectedChat(null)}
          >
            ← Back to chats
          </Button>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isSelf ? "justify-end" : "justify-start"}`}
                >
                  <div className={`chat-bubble ${msg.isSelf ? "chat-bubble-sent" : "chat-bubble-received"}`}>
                    {!msg.isSelf && (
                      <p className="text-xs text-primary mb-1 font-medium">{msg.sender}</p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-input border-border"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button size="icon" className="btn-primary" onClick={handleSend}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatPanel;
