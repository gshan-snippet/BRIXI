import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { messagesAPI } from "@/lib/api";
import { toast } from "sonner";

const Messages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const userId = sessionStorage.getItem("userId") || "";
  const userRole = sessionStorage.getItem("userRole");
  const userName = sessionStorage.getItem("userName") || "";
  const userPhone = sessionStorage.getItem("userPhone") || "";
  
  // For consumers, the operator ID is always "operator-1"
  const operatorId = "operator-1";

  // Helper function to determine message sender role
  const getSenderRole = (msg: any): string => {
    if (msg.senderRole) return msg.senderRole;
    // Fallback: infer from userId
    // If message is from the operator (userId doesn't match current operator's userId), it's from consumer
    if (userRole === "operator" && msg.userId !== userId) return "consumer";
    if (userRole === "consumer" && msg.userId === userId) return "consumer";
    return "operator";
  };

  useEffect(() => {
    if (userRole === "operator" && !isInputFocused) {
      fetchOperatorMessages();
      // Refresh operator messages every 3 seconds - ONLY when input is NOT focused
      const interval = setInterval(fetchOperatorMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [userRole, isInputFocused]);

  useEffect(() => {
    if (userRole === "consumer" && !isInputFocused) {
      fetchConsumerMessages();
      // Auto-refresh consumer messages every 2 seconds - ONLY when input is NOT focused
      const interval = setInterval(fetchConsumerMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [userRole, isInputFocused]);

  // Auto-refresh conversation every 2 seconds when operator is viewing - ONLY when input is NOT focused
  useEffect(() => {
    if (selectedUserId && userRole === "operator" && !isInputFocused) {
      const interval = setInterval(() => {
        fetchConversation(selectedUserId);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedUserId, userRole, isInputFocused]);

  // Preserve input focus when messages update
  useEffect(() => {
    if (inputRef.current && document.activeElement === inputRef.current) {
      // Input is already focused, keep it that way
      inputRef.current.focus();
    }
  }, [messages]);

  const fetchOperatorMessages = async () => {
    setLoading(true);
    try {
      const response = await messagesAPI.getOperatorMessages(userId);
      setConversations(response);
    } catch (error) {
      console.error("Failed to fetch messages", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const fetchConsumerMessages = async () => {
    setLoading(true);
    try {
      const response = await messagesAPI.getConversation(operatorId, userId);
      setMessages(response);
    } catch (error) {
      console.error("Failed to fetch messages", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (uId: string) => {
    setLoading(true);
    try {
      const response = await messagesAPI.getConversation(userId, uId);
      setMessages(response);
      setSelectedUserId(uId);
    } catch (error) {
      console.error("Failed to fetch conversation", error);
      toast.error("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (uId: string) => {
    if (!confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) {
      return;
    }

    try {
      const result = await messagesAPI.deleteConversation(userId, uId);
      if (result.success) {
        toast.success("Conversation deleted successfully");
        if (selectedUserId === uId) {
          setSelectedUserId(null);
        }
        fetchOperatorMessages();
      } else {
        toast.error(result.error || "Failed to delete conversation");
      }
    } catch (error) {
      toast.error("Error deleting conversation");
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      if (userRole === "consumer") {
        await messagesAPI.sendMessage(operatorId, userId, userName, input.trim(), 'consumer');
        await fetchConsumerMessages();
      } else if (userRole === "operator" && selectedUserId) {
        // Operator sending message to consumer
        await messagesAPI.sendMessage(userId, selectedUserId, userName, input.trim(), 'operator');
        await fetchConversation(selectedUserId);
      }
      setInput("");
      // Focus input after sending message
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } catch (error) {
      console.error("Failed to send message", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  // Operator view - show list of users
  if (userRole === "operator") {
    return (
      <div className="flex h-[calc(100vh-5rem)] md:h-screen">
        {/* Conversations list */}
        <div className={cn(
          "border-r border-border overflow-y-auto",
          selectedUserId ? "hidden md:w-1/3 md:flex md:flex-col" : "w-full md:w-1/3"
        )}>
          <div className="p-4">
            <h1 className="font-heading text-2xl font-bold mb-4">Messages</h1>
            {conversations.length > 0 ? (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.userId}
                    className="flex items-center gap-2 group"
                  >
                    <button
                      onClick={() => fetchConversation(conv.userId)}
                      className={cn(
                        "flex-1 text-left p-3 rounded-lg transition-colors",
                        selectedUserId === conv.userId ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      )}
                    >
                      <p className="font-semibold">{conv.userName}</p>
                      <p className="text-sm opacity-70 truncate">
                        {conv.lastMessage?.type === "appointment" 
                          ? `Appointment Request - ${conv.lastMessage?.typeOfWork}`
                          : (conv.lastMessage?.messageText || "No messages")}
                      </p>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDeleteConversation(conv.userId)}
                          className="text-destructive"
                        >
                          Delete Conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No messages yet</p>
            )}
          </div>
        </div>

        {/* Chat view */}
        {selectedUserId && (
          <div className="flex flex-col flex-1 p-4 md:p-8 max-w-full md:max-w-2xl">
            {/* Back button for mobile */}
            <button
              onClick={() => setSelectedUserId(null)}
              className="md:hidden mb-4 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Messages
            </button>
            <h2 className="font-heading text-2xl font-bold mb-4">
              {conversations.find(c => c.userId === selectedUserId)?.userName}
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 flex flex-col">
              {messages.map((msg) => {
                const senderRole = getSenderRole(msg);
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex animate-fade-in",
                      senderRole === "operator" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm max-w-[80%]",
                        senderRole === "operator"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      )}
                    >
                      {msg.type === "appointment" ? (
                        <div>
                          <p><strong>Appointment Request</strong></p>
                          <p>Date: {msg.appointmentDate}</p>
                          <p>Location: {msg.location}</p>
                          <p>Hours: {msg.workingHours}</p>
                          <p>Type: {msg.typeOfWork}</p>
                          {msg.userPhone && <p>Phone: {msg.userPhone}</p>}
                        </div>
                      ) : (
                        msg.messageText
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 mt-auto">
              <Input
                ref={inputRef}
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                disabled={loading}
                className="flex-1"
              />
              <Button size="icon" onClick={sendMessage} disabled={loading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Consumer view - show messages with operator
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] md:h-screen p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="font-heading text-3xl font-bold mb-4">Messages with Operator</h1>
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 flex flex-col">
        {messages.length > 0 ? (
          messages.map((msg) => {
            const senderRole = getSenderRole(msg);
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex animate-fade-in",
                  senderRole === "consumer" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm max-w-[80%]",
                    senderRole === "consumer"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}
                >
                  {msg.type === "appointment" ? (
                    <div>
                      <p><strong>Appointment Request</strong></p>
                      <p>Date: {msg.appointmentDate}</p>
                      <p>Location: {msg.location}</p>
                      <p>Hours: {msg.workingHours}</p>
                      <p>Type: {msg.typeOfWork}</p>
                    </div>
                  ) : (
                    msg.messageText
                  )}
                </div>
                <span className="text-xs text-muted-foreground mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-center text-muted-foreground py-8">No messages yet. Start a conversation!</p>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          disabled={loading}
          className="flex-1"
        />
        <Button size="icon" onClick={sendMessage} disabled={loading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Messages;
