import { listControlsForSelection } from "@/lib/generator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Category, FrameworkId } from "@/types/domain";

interface CategoryBrowseProps {
  categories: Category[];
  selectedFrameworkIds: FrameworkId[];
  mode: "random" | "category";
  categoryId?: string;
  onModeChange(mode: "random" | "category"): void;
  onCategoryChange(id: string | undefined): void;
}

export function CategoryBrowse({
  categories,
  selectedFrameworkIds,
  mode,
  categoryId,
  onModeChange,
  onCategoryChange,
}: CategoryBrowseProps) {
  const hasFrameworkSelection = selectedFrameworkIds.length > 0;
  const selectedCategoryId = mode === "category" ? categoryId : undefined;
  const controls = listControlsForSelection(
    selectedFrameworkIds,
    selectedCategoryId,
  );

  function handleModeValueChange(value: string[]) {
    const nextMode = value[0];
    if (nextMode === "random" || nextMode === "category") {
      onModeChange(nextMode);
    }
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-5 rounded-2xl border border-border bg-card/80 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-primary">
            Category browse
          </h2>
          <p className="text-sm text-muted-foreground">
            Start randomly from the selected frameworks or choose a category for
            a narrower drill.
          </p>
        </div>
        <ToggleGroup
          value={[mode]}
          onValueChange={handleModeValueChange}
          className="rounded-xl border border-border bg-background/60 p-1"
          aria-label="Drill mode"
        >
          <ToggleGroupItem
            value="random"
            aria-label="Random"
            className="data-pressed:bg-primary data-pressed:text-primary-foreground"
          >
            Random
          </ToggleGroupItem>
          <ToggleGroupItem
            value="category"
            aria-label="Select category"
            className="data-pressed:bg-primary data-pressed:text-primary-foreground"
          >
            Select category
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <Separator />

      {!hasFrameworkSelection ? (
        <Empty className="min-h-72 border border-border bg-background/40">
          <EmptyHeader>
            <EmptyTitle>Select a framework</EmptyTitle>
            <EmptyDescription>
              Choose at least one framework from the sidebar to reveal matching
              categories and controls.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : categories.length === 0 ? (
        <Empty className="min-h-72 border border-border bg-background/40">
          <EmptyHeader>
            <EmptyTitle>No matching categories</EmptyTitle>
            <EmptyDescription>
              This framework/category combination does not have mapped controls
              yet. Try Random mode or select a different framework set.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary text-primary-foreground">
              {controls.length} controls
            </Badge>
            <Badge variant="outline" className="border-primary/50 text-primary">
              {categories.length} categories
            </Badge>
          </div>

          {mode === "random" ? (
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Random mode will pick any matching control across the selected
                framework set. Switch to category mode to focus on one control
                family.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => {
                const categoryControls = listControlsForSelection(
                  selectedFrameworkIds,
                  category.id,
                );
                const selected = category.id === categoryId;

                return (
                  <Button
                    key={category.id}
                    type="button"
                    variant="outline"
                    aria-pressed={selected}
                    onClick={() => onCategoryChange(category.id)}
                    className="h-auto justify-start rounded-xl border-border bg-background/40 p-4 text-left hover:border-primary/70 hover:bg-primary/5 aria-pressed:border-primary aria-pressed:bg-primary/10"
                  >
                    <span className="flex w-full flex-col gap-3">
                      <span className="font-semibold text-foreground">
                        {category.name}
                      </span>
                      <span className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {categoryControls.length} controls
                        </Badge>
                        <Badge variant="outline">
                          {category.frameworkIds.length} frameworks
                        </Badge>
                      </span>
                    </span>
                  </Button>
                );
              })}
            </div>
          )}

          <EmptyContent className="max-w-none items-start rounded-xl border border-border bg-background/40 p-4 text-left">
            <p className="text-sm leading-6 text-muted-foreground">
              Drill generation uses the current framework selection
              {mode === "category" && categoryId
                ? " and selected category"
                : ""}
              .
            </p>
          </EmptyContent>
        </div>
      )}
    </section>
  );
}
