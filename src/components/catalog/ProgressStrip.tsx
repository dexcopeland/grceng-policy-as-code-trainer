import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ProgressState } from "@/lib/progress";

interface ProgressStripProps {
  progress: ProgressState;
  onClearProgress(): void;
}

export function ProgressStrip({
  progress,
  onClearProgress,
}: ProgressStripProps) {
  const hasProgress =
    progress.recentDrills.length > 0 || progress.quizScores.length > 0;
  const latestDrills = progress.recentDrills.slice(0, 3);
  const latestScores = progress.quizScores.slice(0, 3);

  return (
    <section className="grid gap-4 rounded-2xl border border-border bg-card/80 p-5 md:grid-cols-[1fr_auto_1fr_auto] md:items-start">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Recent drills
          </h2>
          <Badge variant="outline">{progress.recentDrills.length}</Badge>
        </div>
        {latestDrills.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Start a drill to build your practice history.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {latestDrills.map((drill) => (
              <div
                key={`${drill.controlId}-${drill.at}`}
                className="flex flex-wrap items-center gap-2 text-sm"
              >
                <Badge className="bg-primary text-primary-foreground">
                  {drill.controlId}
                </Badge>
                <span className="text-foreground">{drill.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator orientation="vertical" className="hidden md:block" />
      <Separator className="md:hidden" />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Quiz scores
          </h2>
          <Badge variant="outline">{progress.quizScores.length}</Badge>
        </div>
        {latestScores.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Scores appear here after drill quizzes.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {latestScores.map((score) => (
              <div
                key={`${score.controlId}-${score.at}`}
                className="flex flex-wrap items-center gap-2 text-sm"
              >
                <Badge variant="secondary">{score.controlId}</Badge>
                <span className="text-foreground">
                  {score.score}/{score.total}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onClearProgress}
        disabled={!hasProgress}
        className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary md:self-center"
      >
        Clear progress
      </Button>
    </section>
  );
}
