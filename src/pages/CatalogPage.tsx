import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import {
  generateDrill,
  listCategoriesForFrameworks,
  listControlsForSelection,
} from "@/lib/generator";
import type { Drill } from "@/types/domain";

interface CatalogPageProps {
  onStartDrill(drill: Drill): void;
}

export function CatalogPage({ onStartDrill }: CatalogPageProps) {
  const selection = useDrillSelection();
  const { progress, clear } = useProgress();
  const [error, setError] = useState<string | null>(null);

  function handleClearProgress() {
    const result = clear();
    if (result.persisted) {
      toast.success("Progress cleared.");
    } else {
      toast.error("Could not clear saved progress. Try again or clear site data.");
    }
  }

  const categories = useMemo(
    () => listCategoriesForFrameworks(selection.frameworkIds),
    [selection.frameworkIds],
  );
  const selectedCategoryControls = useMemo(
    () =>
      selection.mode === "category" && selection.categoryId
        ? listControlsForSelection(selection.frameworkIds, selection.categoryId)
        : [],
    [selection.categoryId, selection.frameworkIds, selection.mode],
  );
  const randomControls = useMemo(
    () => listControlsForSelection(selection.frameworkIds),
    [selection.frameworkIds],
  );
  const canStart =
    selection.mode === "random"
      ? randomControls.length > 0
      : selectedCategoryControls.length > 0;
  const startHelperText =
    selection.frameworkIds.length === 0
      ? "Select at least one framework before starting a drill."
      : selection.mode === "category" && !selection.categoryId
        ? "Choose a category or switch back to Random mode to start."
        : "Start Drill creates a generated exercise from your current selection.";

  useEffect(() => {
    if (
      selection.categoryId &&
      (!categories.some((category) => category.id === selection.categoryId) ||
        listControlsForSelection(
          selection.frameworkIds,
          selection.categoryId,
        ).length === 0)
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
        <ProgressStrip progress={progress} onClearProgress={handleClearProgress} />

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
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  {startHelperText}
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
