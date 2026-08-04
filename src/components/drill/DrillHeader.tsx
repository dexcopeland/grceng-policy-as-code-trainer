import { ArrowLeftIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Drill } from "@/types/domain";

interface DrillHeaderProps {
  drill: Drill;
  onBack(): void;
}

export function DrillHeader({ drill, onBack }: DrillHeaderProps) {
  return (
    <header className="flex flex-col gap-5 rounded-2xl border border-border bg-card/80 p-5 md:flex-row md:items-start md:justify-between">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-primary text-primary-foreground">
            {drill.control.id}
          </Badge>
          <Badge variant="outline" className="border-primary/50 text-primary">
            {drill.category.name}
          </Badge>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Drill workspace
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
            {drill.control.title}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            Practice translating the control statement into Rego, inspect the
            evidence window, evaluate mock facts, and finish with a quick quiz.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Framework coverage">
          {drill.frameworks.map((framework) => (
            <Badge key={framework.id} variant="secondary">
              {framework.name} {framework.versionLabel}
            </Badge>
          ))}
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        className="w-fit border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
      >
        <ArrowLeftIcon aria-hidden="true" />
        Back to catalog
      </Button>
    </header>
  );
}
