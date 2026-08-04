import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Drill } from "@/types/domain";

interface RegoPanelProps {
  drill: Drill;
}

export function RegoPanel({ drill }: RegoPanelProps) {
  return (
    <section
      aria-label="Policy as code"
      className="flex min-h-full flex-col gap-5 rounded-2xl border border-border bg-card/80 p-5"
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Rego
        </p>
        <h2 className="text-2xl font-semibold text-primary">
          Policy as code
        </h2>
      </div>
      <Separator />
      <pre className="code-surface overflow-x-auto rounded-xl border border-primary/30 p-4 text-xs leading-6 shadow-inner md:text-sm">
        <code>{drill.rego}</code>
      </pre>
      <div className="flex flex-col gap-3" aria-label="Rego annotations">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Annotations
        </h3>
        <ul className="grid gap-3">
          {drill.annotations.map((annotation) => (
            <li
              key={annotation.label}
              className="rounded-xl border border-border bg-background/40 p-3"
            >
              <div className="flex flex-col gap-2">
                <Badge variant="secondary" className="w-fit">
                  {annotation.label}
                </Badge>
                <p className="text-sm leading-6 text-muted-foreground">
                  {annotation.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
