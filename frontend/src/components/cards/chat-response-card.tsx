import { TAIChat } from "@/types";
import { cva } from "class-variance-authority";

export default function ChatResponseCard({ role, content }: TAIChat) {
  const messageClassName = cva("inline-block p-2 rounded-lg", {
    variants: {
      role: {
        user: "bg-blue-500 text-white",
        assistant: "bg-gray-200 text-black",
      },
    },
    defaultVariants: {
      role: "user",
    },
  });

  return (
    <div className={`mb-4 ${role === "user" ? "text-right" : "text-left"}`}>
      <span
        className={messageClassName({
          role: role as "user" | "assistant",
        })}
      >
        {content}
      </span>
    </div>
  );
}
