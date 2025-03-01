import { SendHorizonalIcon } from "lucide-react";
import { Button } from "../ui";
import { Textarea } from "../ui/textarea";
import { useRef } from "react";

type FormValues = {
  content: string;
};

type ChatFormProps = {
  disabled: boolean;
  onSubmit: (values: FormValues) => Promise<void>;
};

export default function ChatForm({ disabled, onSubmit }: ChatFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const content = formData.get("content") as string;
      await onSubmit({ content });
      formRef.current?.reset();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="w-full space-y-2 shadow-lg py-4 px-3 border border-gray-200 rounded-xl"
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          formRef.current?.dispatchEvent(
            new Event("submit", { bubbles: true, cancelable: true })
          );
        }
      }}
    >
      <Textarea
        name="content"
        placeholder="Ask about the file..."
        className="flex-grow border-none shadow-none focus-visible:ring-0 resize-none"
        disabled={disabled}
      />
      <Button
        type="submit"
        disabled={disabled}
        className="flex ml-auto"
        size="icon"
      >
        <SendHorizonalIcon />
      </Button>
    </form>
  );
}
