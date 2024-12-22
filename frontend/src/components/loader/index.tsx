// loader.tsx

import { cn } from "../../lib/utils";

const Loader = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex h-screen w-full items-center justify-center",
        className
      )}
    >
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-bounce rounded-full bg-primary"></div>
        <div className="h-4 w-4 animate-bounce rounded-full bg-primary"></div>
        <div className="h-4 w-4 animate-bounce rounded-full bg-primary"></div>
      </div>
    </div>
  );
};

export default Loader;
