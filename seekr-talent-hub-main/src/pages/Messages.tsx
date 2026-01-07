import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Search, Send, Paperclip, Smile } from "lucide-react";
import { toast } from "sonner";

const Messages = () => {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(1);
  const [messageInput, setMessageInput] = useState("");

  const conversations = [
    {
      id: 1,
      name: "Sarah Mitchell",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      lastMessage: "Thanks for connecting! Would love to discuss...",
      time: "2m ago",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: "Mike Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
      lastMessage: "Great session today! See you next week.",
      time: "1h ago",
      unread: 0,
      online: true,
    },
    {
      id: 3,
      name: "Elite Sports Turf",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Elite",
      lastMessage: "Your booking is confirmed for tomorrow",
      time: "3h ago",
      unread: 0,
      online: false,
    },
    {
      id: 4,
      name: "Raj Kumar",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Raj",
      lastMessage: "Impressive highlights! Keep it up 👍",
      time: "1d ago",
      unread: 0,
      online: false,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "other",
      text: "Hi! I saw your football reels. Really impressive!",
      time: "10:30 AM",
    },
    {
      id: 2,
      sender: "me",
      text: "Thank you! I appreciate it.",
      time: "10:32 AM",
    },
    {
      id: 3,
      sender: "other",
      text: "Thanks for connecting! Would love to discuss potential opportunities with you.",
      time: "10:33 AM",
    },
    {
      id: 4,
      sender: "me",
      text: "That sounds great! I'd love to hear more about it.",
      time: "10:35 AM",
    },
  ];

  const handleSend = () => {
    if (messageInput.trim()) {
      toast.success("Message sent!");
      setMessageInput("");
    }
  };

  const handleAttachment = () => {
    toast.info("File attachment coming soon!");
  };

  const handleEmoji = () => {
    toast.info("Emoji picker coming soon!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-7xl py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-[350px,1fr] h-[calc(100vh-12rem)]">
            {/* Conversations List */}
            <div className="border-r border-border">
              <div className="p-4 border-b border-border">
                <h2 className="text-xl font-bold mb-4">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search messages..." 
                    className="pl-10"
                    onChange={(e) => {
                      if (e.target.value) {
                        toast.info("Search functionality coming soon!");
                      }
                    }}
                  />
                </div>
              </div>

              <ScrollArea className="h-[calc(100%-9rem)]">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedChat(conv.id)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-accent/50 transition-colors border-b border-border ${
                      selectedChat === conv.id ? "bg-accent/30" : ""
                    }`}
                  >
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-primary/10 overflow-hidden">
                        <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" />
                      </div>
                      {conv.online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-primary rounded-full border-2 border-card" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">{conv.name}</h3>
                        <span className="text-xs text-muted-foreground">{conv.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {conv.unread}
                      </div>
                    )}
                  </button>
                ))}
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-primary/10 overflow-hidden">
                    <img 
                      src={conversations.find(c => c.id === selectedChat)?.avatar} 
                      alt="User" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  {conversations.find(c => c.id === selectedChat)?.online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-primary rounded-full border-2 border-card" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {conversations.find(c => c.id === selectedChat)?.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {conversations.find(c => c.id === selectedChat)?.online ? "Active now" : "Offline"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          message.sender === "me"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <span className="text-xs opacity-70 mt-1 block">{message.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handleAttachment}>
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleEmoji}>
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1"
                  />
                  <Button onClick={handleSend}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Messages;