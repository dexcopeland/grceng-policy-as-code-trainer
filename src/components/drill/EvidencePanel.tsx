import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Drill } from "@/types/domain";

interface EvidencePanelProps {
  drill: Drill;
}

export function EvidencePanel({ drill }: EvidencePanelProps) {
  return (
    <section aria-label="Evidence requirements" className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-primary">Evidence</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Gather artifacts that prove the control is operating within the
            selected evidence window.
          </p>
        </div>
        <Badge variant="outline" className="border-primary/50 text-primary">
          {drill.evidence.window.start} to {drill.evidence.window.end}
        </Badge>
      </div>
      <Separator />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/40 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Artifacts
          </h3>
          <ul className="grid gap-2">
            {drill.evidence.artifacts.map((artifact) => (
              <li
                key={artifact}
                className="rounded-lg border border-border bg-card/60 px-3 py-2 text-sm text-foreground"
              >
                {artifact}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/40 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Evidence query
          </h3>
          <pre className="code-surface overflow-x-auto rounded-lg border border-primary/30 p-3 text-xs leading-6">
            <code>{drill.evidence.query}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
