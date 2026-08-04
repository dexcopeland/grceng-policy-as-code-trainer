import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Drill } from "@/types/domain";

interface StatementPanelProps {
  drill: Drill;
}

export function StatementPanel({ drill }: StatementPanelProps) {
  return (
    <section
      aria-label="Control statement"
      className="flex min-h-full flex-col gap-5 rounded-2xl border border-border bg-card/80 p-5"
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Statement
        </p>
        <h2 className="text-2xl font-semibold text-primary">
          Control statement
        </h2>
      </div>
      <Separator />
      <div className="flex flex-col gap-4">
        <p className="text-base leading-7 text-foreground">{drill.statement}</p>
        <div className="rounded-xl border border-border bg-background/40 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Objective
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {drill.control.objective}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {drill.control.keywords.map((keyword) => (
            <Badge key={keyword} variant="outline">
              {keyword}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
