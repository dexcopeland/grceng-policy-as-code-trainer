import { useState } from "react";
import { toast } from "sonner";
import { CatalogPage } from "@/pages/CatalogPage";
import { DrillPage } from "@/pages/DrillPage";
import { Toaster } from "@/components/ui/sonner";
import { saveDrillProgress } from "@/lib/progress";
import type { Drill } from "@/types/domain";

export default function App() {
  const [view, setView] = useState<"catalog" | "drill">("catalog");
  const [drill, setDrill] = useState<Drill | null>(null);

  function handleStartDrill(nextDrill: Drill) {
    const result = saveDrillProgress({
      controlId: nextDrill.control.id,
      title: nextDrill.control.title,
      frameworkIds: nextDrill.frameworks.map((framework) => framework.id),
      at: new Date().toISOString(),
    });
    if (!result.persisted) {
      toast.warning("Drill started, but progress could not be saved locally.");
    }
    setDrill(nextDrill);
    setView("drill");
  }

  if (view === "drill" && drill) {
    return (
      <>
        <DrillPage drill={drill} onBack={() => setView("catalog")} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <CatalogPage onStartDrill={handleStartDrill} />
      <Toaster />
    </>
  );
}
