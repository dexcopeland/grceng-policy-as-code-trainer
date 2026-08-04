import { useState } from "react";
import { CatalogPage } from "@/pages/CatalogPage";
import { Button } from "@/components/ui/button";
import { saveDrillProgress } from "@/lib/progress";
import type { Drill } from "@/types/domain";

export default function App() {
  const [view, setView] = useState<"catalog" | "drill">("catalog");
  const [drill, setDrill] = useState<Drill | null>(null);

  function handleStartDrill(nextDrill: Drill) {
    saveDrillProgress({
      controlId: nextDrill.control.id,
      title: nextDrill.control.title,
      frameworkIds: nextDrill.frameworks.map((framework) => framework.id),
      at: new Date().toISOString(),
    });
    setDrill(nextDrill);
    setView("drill");
  }

  if (view === "drill" && drill) {
    return (
      <main className="min-h-screen bg-background px-4 py-6 text-foreground md:px-8 md:py-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 rounded-2xl border border-border bg-card/80 p-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Drill preview
            </p>
            <h1 className="text-3xl font-bold text-primary">
              {drill.control.title}
            </h1>
            <p className="text-muted-foreground">
              Full drill UI arrives in Task 6. This placeholder confirms catalog
              navigation and progress capture.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setView("catalog")}
            className="w-fit border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
          >
            Back to catalog
          </Button>
        </div>
      </main>
    );
  }

  return (
    <CatalogPage onStartDrill={handleStartDrill} />
  );
}
