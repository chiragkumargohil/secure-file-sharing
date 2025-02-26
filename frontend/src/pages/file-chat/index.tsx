import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import resourcesApi from "@/apis/resources.api";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

type TAIChat = {
  id: string | number;
  role: string;
  content: string;
};

export default function FileChatPage() {
  const { fileId } = useParams();
  const [messages, setMessages] = useState([
    { id: 1, role: "user", content: "Hello" },
    { id: 2, role: "assistant", content: "Hi there!" },
  ]);
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
  }, [messages]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsTyping(true);
      const formData = new FormData(e.currentTarget);
      const content = formData.get("content") as string;
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
    <div className="flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Chat with File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[60vh] pr-4" ref={scrollAreaRef}>
            {messages.map((m: TAIChat) => (
              <div
                key={m.id}
                className={`mb-4 ${
                  m.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <span
                  className={`inline-block p-2 rounded-lg ${
                    m.role === "user"
                      ? "bg-blue-500 text-white"
                      : m.role === "assistant"
                      ? "bg-gray-200 text-black"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {m.content}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="text-left">
                <span className="inline-block p-2 rounded-lg bg-gray-200 text-black">
                  AI is typing...
                </span>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form onSubmit={onSubmit} className="flex w-full space-x-2">
            <Input
              name="content"
              placeholder="Ask about the file..."
              className="flex-grow"
              disabled={isTyping}
            />
            <Button type="submit" disabled={isTyping}>
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
