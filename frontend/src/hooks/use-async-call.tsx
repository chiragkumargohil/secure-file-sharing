import { TError } from "@/types";
import { useCallback, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useAsyncCall = <T extends (...args: any[]) => any>(fn: T) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TError["type"] | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const call = useCallback(async (...args: any[]) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await fn(...args);
      setData(result);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e?.status === 401) {
        setError("not-found");
      } else if (e?.status === 403) {
        setError("no-access");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, data, call };
};

export default useAsyncCall;
