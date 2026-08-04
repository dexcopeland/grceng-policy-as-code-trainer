import { useState } from "react";
import type { FrameworkId } from "@/types/domain";

export interface DrillSelection {
  frameworkIds: FrameworkId[];
  mode: "random" | "category";
  categoryId?: string;
  toggleFramework(id: FrameworkId): void;
  setMode(mode: "random" | "category"): void;
  setCategoryId(id: string | undefined): void;
}

export function useDrillSelection(): DrillSelection {
  const [frameworkIds, setFrameworkIds] = useState<FrameworkId[]>([]);
  const [mode, setModeState] = useState<"random" | "category">("random");
  const [categoryId, setCategoryId] = useState<string | undefined>();

  function toggleFramework(id: FrameworkId) {
    setFrameworkIds((current) =>
      current.includes(id)
        ? current.filter((frameworkId) => frameworkId !== id)
        : [...current, id],
    );
  }

  function setMode(nextMode: "random" | "category") {
    setModeState(nextMode);
    if (nextMode === "random") {
      setCategoryId(undefined);
    }
  }

  return {
    frameworkIds,
    mode,
    categoryId,
    toggleFramework,
    setMode,
    setCategoryId,
  };
}
