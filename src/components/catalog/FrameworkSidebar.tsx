import { frameworks } from "@/data";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { FrameworkId } from "@/types/domain";

interface FrameworkSidebarProps {
  selectedFrameworkIds: FrameworkId[];
  onToggleFramework(id: FrameworkId): void;
}

export function FrameworkSidebar({
  selectedFrameworkIds,
  onToggleFramework,
}: FrameworkSidebarProps) {
  const selected = new Set(selectedFrameworkIds);

  return (
    <aside className="flex w-full flex-col gap-5 rounded-2xl border border-border bg-card/80 p-5 text-card-foreground md:w-80 md:shrink-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-primary">Frameworks</h2>
          <p className="text-sm text-muted-foreground">
            Select one or more catalogs to build a drill pool.
          </p>
        </div>
        <Badge variant="outline" className="border-primary/50 text-primary">
          {selectedFrameworkIds.length}
        </Badge>
      </div>
      <Separator />
      <div className="flex flex-col gap-3">
        {frameworks.map((framework) => {
          const checked = selected.has(framework.id);
          return (
            <div
              key={framework.id}
              className="flex items-start gap-3 rounded-xl border border-border bg-background/40 p-3 transition-colors hover:border-primary/60 hover:bg-primary/5"
            >
              <Checkbox
                aria-label={framework.name}
                checked={checked}
                onCheckedChange={() => onToggleFramework(framework.id)}
                className="mt-1 border-primary/60 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {framework.name}
                  </span>
                  <Badge variant="secondary">{framework.versionLabel}</Badge>
                </span>
                <span className="text-sm leading-5 text-muted-foreground">
                  {framework.description}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
