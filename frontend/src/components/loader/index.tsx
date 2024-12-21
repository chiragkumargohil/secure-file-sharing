// loader.tsx

import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

const Loader = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        className
      )}
    >
      <Loader2 className="animate-spin" />
    </div>
  );
};

export default Loader;
