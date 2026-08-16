import { useMemo, useState } from "react";
import { DrillHeader } from "@/components/drill/DrillHeader";
import { EvidencePanel } from "@/components/drill/EvidencePanel";
import { EvaluatePanel } from "@/components/drill/EvaluatePanel";
import { FlowPanel } from "@/components/drill/FlowPanel";
import { QuizPanel } from "@/components/drill/QuizPanel";
import { RegoPanel } from "@/components/drill/RegoPanel";
import { StatementPanel } from "@/components/drill/StatementPanel";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { Drill } from "@/types/domain";

interface DrillViewProps {
  drill: Drill;
  onBack(): void;
}

function defaultScenarioId(drill: Drill): string {
  return (
    drill.scenarios.find((scenario) => scenario.expected === "allow")?.id ??
    drill.scenarios[0]?.id ??
    ""
  );
}

export function DrillView({ drill, onBack }: DrillViewProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(() =>
    defaultScenarioId(drill),
  );
  const [userPickedScenario, setUserPickedScenario] = useState(false);

  const scenarioId = useMemo(() => {
    if (drill.scenarios.some((scenario) => scenario.id === selectedScenarioId)) {
      return selectedScenarioId;
    }
    return defaultScenarioId(drill);
  }, [drill, selectedScenarioId]);

  function handleSelectScenario(scenarioId: string) {
    setSelectedScenarioId(scenarioId);
    setUserPickedScenario(true);
  }

  return (
    <div className="drill-enter mx-auto flex max-w-7xl flex-col gap-6">
      <DrillHeader drill={drill} onBack={onBack} />

      <div className="grid gap-5 md:grid-cols-2">
        <StatementPanel drill={drill} />
        <RegoPanel drill={drill} />
      </div>

      <section
        aria-label="Drill practice panels"
        className="rounded-2xl border border-border bg-card/80 p-5"
      >
        <Tabs defaultValue="flow" className="gap-5">
          <TabsList
            aria-label="Drill secondary panels"
            className="h-auto flex-wrap justify-start rounded-xl bg-background/60 p-1"
          >
            <TabsTrigger
              value="flow"
              className="px-3 py-2 data-active:bg-primary data-active:text-primary-foreground"
            >
              Flow
            </TabsTrigger>
            <TabsTrigger
              value="evidence"
              className="px-3 py-2 data-active:bg-primary data-active:text-primary-foreground"
            >
              Evidence
            </TabsTrigger>
            <TabsTrigger
              value="evaluate"
              className="px-3 py-2 data-active:bg-primary data-active:text-primary-foreground"
            >
              Evaluate
            </TabsTrigger>
            <TabsTrigger
              value="quiz"
              className="px-3 py-2 data-active:bg-primary data-active:text-primary-foreground"
            >
              Quiz
            </TabsTrigger>
          </TabsList>
          <TabsContent value="flow" className="animate-in fade-in">
            <FlowPanel
              drill={drill}
              selectedScenarioId={scenarioId}
              userPickedScenario={userPickedScenario}
            />
          </TabsContent>
          <TabsContent value="evidence" className="animate-in fade-in">
            <EvidencePanel drill={drill} />
          </TabsContent>
          <TabsContent value="evaluate" className="animate-in fade-in">
            <EvaluatePanel
              drill={drill}
              selectedScenarioId={scenarioId}
              onSelectScenario={handleSelectScenario}
            />
          </TabsContent>
          <TabsContent value="quiz" className="animate-in fade-in">
            <QuizPanel drill={drill} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
