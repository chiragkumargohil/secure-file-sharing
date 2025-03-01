import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import resourcesApi from "@/apis/resources.api";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import ChatForm from "@/components/forms/chat-form";
import { TAIChat } from "@/types";
import ChatResponseCard from "@/components/cards/chat-response-card";

export default function FileChatPage() {
  const { fileId } = useParams();
  const [messages, setMessages] = useState<TAIChat[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await resourcesApi.getFileChat(fileId as string);
        setMessages(data.chat_history);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch messages");
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages.length]);

  const onSubmit = async ({ content }: { content: string }) => {
    try {
      setIsTyping(true);
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, role: "user", content },
      ]);

      const response = await resourcesApi.sendFileChatMessage(
        fileId as string,
        {
          content,
        }
      );
      const { data } = response;
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, role: data.role, content: data.content || "" },
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative h-full flex flex-col items-center justify-center max-w-2xl mx-auto">
      <div className="w-full h-full flex-1 flex flex-col justify-between gap-2">
        <ScrollArea className="px-4" ref={scrollAreaRef}>
          <div className="space-y-4 h-[calc(100vh-252px)]">
            {messages.map((m: TAIChat) => (
              <ChatResponseCard key={m.id} {...m} />
            ))}
            {isTyping && (
              <div className="text-left">
                <span className="inline-block p-2 rounded-lg bg-gray-200 text-black">
                  AI is typing...
                </span>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="sticky bottom-0 w-full z-10 bg-background">
        <ChatForm disabled={isTyping} onSubmit={onSubmit} />
      </div>
    </div>
  );
}
