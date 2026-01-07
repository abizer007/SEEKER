import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Search, Send, Paperclip, Smile } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  other_user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  last_message: string;
  last_message_time: string;
  unread: number;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

const MessagesNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadConversations();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages();
      subscribeToMessages();
    }
  }, [selectedConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUserId(user.id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    if (!currentUserId) return;

    const { data: participants } = await supabase
      .from("conversation_participants")
      .select(`
        conversation_id,
        conversations!inner (
          id,
          created_at
        )
      `)
      .eq("user_id", currentUserId);

    if (!participants) {
      setLoading(false);
      return;
    }

    const conversationIds = participants.map((p) => p.conversation_id);

    const conversationsData: Conversation[] = [];

    for (const convId of conversationIds) {
      // Get other participants
      const { data: otherParticipants } = await supabase
        .from("conversation_participants")
        .select(`
          user_id,
          profiles!inner (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("conversation_id", convId)
        .neq("user_id", currentUserId)
        .limit(1);

      if (!otherParticipants || otherParticipants.length === 0) continue;

      // Get last message
      const { data: lastMessage } = await supabase
        .from("messages")
        .select("content, created_at")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: false })
        .limit(1);

      // Get unread count
      const { count: unreadCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", convId)
        .eq("read", false)
        .neq("sender_id", currentUserId);

      conversationsData.push({
        id: convId,
        other_user: {
          id: otherParticipants[0].profiles.id,
          full_name: otherParticipants[0].profiles.full_name,
          avatar_url: otherParticipants[0].profiles.avatar_url,
        },
        last_message: lastMessage?.[0]?.content || "No messages yet",
        last_message_time: lastMessage?.[0]?.created_at || "",
        unread: unreadCount || 0,
      });
    }

    setConversations(conversationsData);
    if (conversationsData.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversationsData[0].id);
    }
    setLoading(false);
  };

  const loadMessages = async () => {
    if (!selectedConversationId) return;

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", selectedConversationId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
      
      // Mark messages as read
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("conversation_id", selectedConversationId)
        .neq("sender_id", currentUserId);
    }
  };

  const subscribeToMessages = () => {
    if (!selectedConversationId) return;

    const channel = supabase
      .channel(`messages:${selectedConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversationId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedConversationId || !currentUserId) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConversationId,
      sender_id: currentUserId,
      content: messageInput.trim(),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return;
    }

    setMessageInput("");
  };

  const getTimeAgo = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    
    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInMins < 1440) return `${Math.floor(diffInMins / 60)}h ago`;
    return `${Math.floor(diffInMins / 1440)}d ago`;
  };

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-7xl py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {conversations.length === 0 ? (
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">No Conversations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start connecting with athletes, coaches, and scouts to begin messaging
            </p>
            <Button onClick={() => navigate("/discover")}>
              Explore Discover
            </Button>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-[350px,1fr] h-[calc(100vh-12rem)]">
              {/* Conversations List */}
              <div className="border-r border-border">
                <div className="p-4 border-b border-border">
                  <h2 className="text-xl font-bold mb-4">Messages</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search messages..." className="pl-10" />
                  </div>
                </div>

                <ScrollArea className="h-[calc(100%-9rem)]">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversationId(conv.id)}
                      className={`w-full p-4 flex items-start gap-3 hover:bg-accent/50 transition-colors border-b border-border ${
                        selectedConversationId === conv.id ? "bg-accent/30" : ""
                      }`}
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 overflow-hidden flex-shrink-0">
                        {conv.other_user.avatar_url ? (
                          <img src={conv.other_user.avatar_url} alt={conv.other_user.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-bold">
                            {conv.other_user.full_name[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold truncate">{conv.other_user.full_name}</h3>
                          <span className="text-xs text-muted-foreground">{getTimeAgo(conv.last_message_time)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conv.last_message}</p>
                      </div>
                      {conv.unread > 0 && (
                        <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
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
                {selectedConversation && (
                  <div className="p-4 border-b border-border flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 overflow-hidden">
                      {selectedConversation.other_user.avatar_url ? (
                        <img 
                          src={selectedConversation.other_user.avatar_url} 
                          alt={selectedConversation.other_user.full_name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold">
                          {selectedConversation.other_user.full_name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedConversation.other_user.full_name}</h3>
                      <p className="text-xs text-muted-foreground">Active now</p>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            message.sender_id === currentUserId
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
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
        )}
      </div>
    </div>
  );
};

export default MessagesNew;
