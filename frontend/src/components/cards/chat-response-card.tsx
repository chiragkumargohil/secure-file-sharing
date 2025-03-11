import { TAIChat } from "@/types";
import { cva } from "class-variance-authority";

export default function ChatResponseCard({ role, content }: TAIChat) {
  const messageClassName = cva("inline-block py-2 px-4 rounded-full", {
    variants: {
      role: {
        user: "bg-primary text-white",
        assistant: "text-black",
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
