import { useEffect, useMemo, useState } from "react";
import { CategoryBrowse } from "@/components/catalog/CategoryBrowse";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { FrameworkSidebar } from "@/components/catalog/FrameworkSidebar";
import { ProgressStrip } from "@/components/catalog/ProgressStrip";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useDrillSelection } from "@/hooks/useDrillSelection";
import { useProgress } from "@/hooks/useProgress";
import { generateDrill, listCategoriesForFrameworks } from "@/lib/generator";
import type { Drill } from "@/types/domain";

interface CatalogPageProps {
  onStartDrill(drill: Drill): void;
}

export function CatalogPage({ onStartDrill }: CatalogPageProps) {
  const selection = useDrillSelection();
  const { progress, clear } = useProgress();
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(
    () => listCategoriesForFrameworks(selection.frameworkIds),
    [selection.frameworkIds],
  );
  const canStart =
    selection.frameworkIds.length > 0 &&
    (selection.mode === "random" || Boolean(selection.categoryId));

  useEffect(() => {
    if (
      selection.categoryId &&
      !categories.some((category) => category.id === selection.categoryId)
    ) {
      selection.setCategoryId(undefined);
    }
  }, [categories, selection]);

  function handleStartDrill() {
    setError(null);

    try {
      const drill = generateDrill({
        frameworkIds: selection.frameworkIds,
        mode: selection.mode,
        categoryId: selection.categoryId,
      });
      onStartDrill(drill);
    } catch (generatorError) {
      setError(
        generatorError instanceof Error
          ? generatorError.message
          : "Unable to start drill.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground md:px-8 md:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <CatalogHeader />
        <ProgressStrip progress={progress} onClearProgress={clear} />

        {error ? (
          <Alert variant="destructive" className="border-destructive/60">
            <AlertTitle>Drill could not start</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <FrameworkSidebar
            selectedFrameworkIds={selection.frameworkIds}
            onToggleFramework={selection.toggleFramework}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <CategoryBrowse
              categories={categories}
              selectedFrameworkIds={selection.frameworkIds}
              mode={selection.mode}
              categoryId={selection.categoryId}
              onModeChange={selection.setMode}
              onCategoryChange={selection.setCategoryId}
            />
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/80 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-primary">
                  Ready to practice?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Start Drill creates a generated exercise from your current
                  selection.
                </p>
              </div>
              <Button
                type="button"
                size="lg"
                disabled={!canStart}
                onClick={handleStartDrill}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Start Drill
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
