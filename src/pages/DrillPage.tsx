import { DrillView } from "@/components/drill/DrillView";
import type { Drill } from "@/types/domain";

interface DrillPageProps {
  drill: Drill;
  onBack(): void;
}

export function DrillPage({ drill, onBack }: DrillPageProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground md:px-8 md:py-10">
      <DrillView drill={drill} onBack={onBack} />
    </main>
  );
}
