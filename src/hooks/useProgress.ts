import { useCallback, useState } from "react";
import {
  clearProgress,
  loadProgress,
  type ProgressState,
} from "@/lib/progress";

export interface UseProgressResult {
  progress: ProgressState;
  clear(): void;
  refresh(): void;
}

export function useProgress(): UseProgressResult {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  const refresh = useCallback(() => {
    setProgress(loadProgress());
  }, []);

  const clear = useCallback(() => {
    setProgress(clearProgress());
  }, []);

  return {
    progress,
    clear,
    refresh,
  };
}
