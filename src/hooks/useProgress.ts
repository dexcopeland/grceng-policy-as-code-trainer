import { useCallback, useState } from "react";
import {
  clearProgress,
  loadProgress,
  type ProgressState,
} from "@/lib/progress";

export interface UseProgressResult {
  progress: ProgressState;
  clear(): { persisted: boolean };
  refresh(): void;
}

export function useProgress(): UseProgressResult {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  const refresh = useCallback(() => {
    setProgress(loadProgress());
  }, []);

  const clear = useCallback(() => {
    const result = clearProgress();
    setProgress(result.state);
    return { persisted: result.persisted };
  }, []);

  return {
    progress,
    clear,
    refresh,
  };
}
