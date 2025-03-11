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
  const [name, setName] = useState("");
  const [messages, setMessages] = useState<TAIChat[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await resourcesApi.getFileChat(fileId as string);
        setName(data?.name || "");
        setMessages(data?.chat_history || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch messages");
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      console.log("scrolling");
      scrollAreaRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
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
    <div className="relative h-full flex flex-col gap-2 items-center justify-center max-w-2xl mx-auto">
      <h2 className="text-lg text-center font-semibold">{name}</h2>
      <div className="w-full h-full flex-1 flex flex-col justify-between gap-2">
        <ScrollArea className="px-4">
          <div className="space-y-4 h-[calc(100vh-284px)]" ref={scrollAreaRef}>
            {messages.map((m: TAIChat, i) => (
              <ChatResponseCard key={m.id || i} {...m} />
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
