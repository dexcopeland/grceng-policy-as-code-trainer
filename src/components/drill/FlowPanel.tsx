import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Drill, FlowNode, FlowStep, PolicyFlow } from "@/types/domain";

interface FlowPanelProps {
  drill: Drill;
  selectedScenarioId: string;
  /** True once the user picks a scenario in Evaluate; survives FlowPanel remounts. */
  userPickedScenario: boolean;
}

const VIEW_WIDTH = 760;
const VIEW_HEIGHT = 320;
const NODE_WIDTH = 118;
const NODE_HEIGHT = 52;
const CONTROL_Y = 48;
const DATA_Y = 210;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function nodePositions(
  flow: PolicyFlow,
): Record<string, { x: number; y: number }> {
  const control = flow.nodes.filter((n) => n.plane === "control");
  const data = flow.nodes.filter((n) => n.plane === "data");
  const positions: Record<string, { x: number; y: number }> = {};

  function place(nodes: FlowNode[], y: number) {
    const count = Math.max(nodes.length, 1);
    const gap = VIEW_WIDTH / (count + 1);
    nodes.forEach((node, index) => {
      positions[node.id] = { x: gap * (index + 1), y };
    });
  }

  place(control, CONTROL_Y);
  place(data, DATA_Y);
  return positions;
}

function playableSteps(
  flow: PolicyFlow,
  selectedScenarioId: string,
): FlowStep[] {
  return flow.steps.filter(
    (step) =>
      !step.fixtureScenarioId || step.fixtureScenarioId === selectedScenarioId,
  );
}

function edgePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  kind: string,
): string {
  if (kind === "decision") {
    const midY = (from.y + to.y) / 2;
    return `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
  }
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
}

export function FlowPanel({
  drill,
  selectedScenarioId,
  userPickedScenario,
}: FlowPanelProps) {
  const flow = drill.flow;
  const steps = useMemo(
    () => playableSteps(flow, selectedScenarioId),
    [flow, selectedScenarioId],
  );
  const positions = useMemo(() => nodePositions(flow), [flow]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!userPickedScenario) {
      setStepIndex(0);
      return;
    }

    const matchIndex = steps.findIndex(
      (step) => step.fixtureScenarioId === selectedScenarioId,
    );
    setStepIndex(matchIndex >= 0 ? matchIndex : 0);
    setPlaying(false);
  }, [selectedScenarioId, steps, userPickedScenario]);

  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const delay = reducedMotion ? 900 : 1100;
    const timer = window.setTimeout(() => {
      setStepIndex((current) => Math.min(current + 1, steps.length - 1));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [playing, stepIndex, steps.length, reducedMotion]);

  const currentStep = steps[stepIndex] ?? steps[0];
  const highlight = new Set(currentStep?.highlight ?? []);
  const packet =
    !reducedMotion && currentStep?.packet ? currentStep.packet : undefined;
  const packetFrom = packet ? positions[packet.from] : null;
  const packetTo = packet ? positions[packet.to] : null;
  const packetStyle =
    packetFrom && packetTo
      ? ({
          "--packet-x1": `${packetFrom.x}px`,
          "--packet-y1": `${packetFrom.y}px`,
          "--packet-x2": `${packetTo.x}px`,
          "--packet-y2": `${packetTo.y}px`,
        } as CSSProperties)
      : undefined;

  function goPrev() {
    setPlaying(false);
    setStepIndex((current) => Math.max(0, current - 1));
  }

  function goNext() {
    setPlaying(false);
    setStepIndex((current) => Math.min(steps.length - 1, current + 1));
  }

  return (
    <section aria-label="Policy flow diagram" className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-primary">Flow</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Watch where the policy decision happens for this family: control plane
          above, data plane below. Topology: {flow.topology}.
        </p>
      </div>
      <Separator />

      <div className="overflow-x-auto rounded-xl border border-border bg-background/40 p-3">
        <svg
          role="img"
          aria-labelledby="flow-caption"
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="flow-diagram mx-auto h-auto w-full min-w-[36rem]"
        >
          <defs>
            <marker
              id="flow-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill="#a3a3a3" />
            </marker>
          </defs>

          <text
            x={16}
            y={28}
            fill="#ff7a18"
            fontSize="12"
            fontWeight="600"
            letterSpacing="0.18em"
          >
            CONTROL PLANE
          </text>
          <text
            x={16}
            y={190}
            fill="#ff7a18"
            fontSize="12"
            fontWeight="600"
            letterSpacing="0.18em"
          >
            DATA PLANE
          </text>
          <line
            x1={12}
            y1={VIEW_HEIGHT / 2}
            x2={VIEW_WIDTH - 12}
            y2={VIEW_HEIGHT / 2}
            stroke="#2a2a2a"
            strokeDasharray="4 6"
          />

          {flow.edges.map((edge) => {
            const from = positions[edge.from];
            const to = positions[edge.to];
            if (!from || !to) return null;
            const active = highlight.has(edge.id);
            const stroke = active
              ? "#ff7a18"
              : edge.kind === "decision"
                ? "rgba(255, 122, 24, 0.45)"
                : "rgba(163, 163, 163, 0.4)";
            return (
              <path
                key={edge.id}
                d={edgePath(from, to, edge.kind)}
                fill="none"
                stroke={stroke}
                strokeWidth={active ? 2.5 : 1.5}
                markerEnd="url(#flow-arrow)"
              />
            );
          })}

          {flow.nodes.map((node) => {
            const pos = positions[node.id];
            if (!pos) return null;
            const active = highlight.has(node.id);
            return (
              <g
                key={node.id}
                transform={`translate(${pos.x - NODE_WIDTH / 2}, ${pos.y - NODE_HEIGHT / 2})`}
              >
                <rect
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx={10}
                  fill={active ? "rgba(255, 122, 24, 0.15)" : "#111111"}
                  stroke={active ? "#ff7a18" : "#2a2a2a"}
                  strokeWidth={active ? 2 : 1}
                />
                <text
                  x={NODE_WIDTH / 2}
                  y={node.software ? 20 : 30}
                  textAnchor="middle"
                  fill="#f5f5f5"
                  fontSize="11"
                  fontWeight="600"
                >
                  {node.label}
                </text>
                {node.software ? (
                  <text
                    x={NODE_WIDTH / 2}
                    y={38}
                    textAnchor="middle"
                    fill="#a3a3a3"
                    fontSize="9"
                  >
                    {node.software}
                  </text>
                ) : null}
              </g>
            );
          })}

          {packet && packetFrom && packetTo ? (
            <g
              key={`${currentStep?.id}-${packet.from}-${packet.to}`}
              className="flow-packet"
              style={packetStyle}
            >
              <circle r={6} fill="#ff7a18" />
            </g>
          ) : null}
        </svg>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/40 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {currentStep?.decision ? (
            <Badge
              className={
                currentStep.decision === "allow"
                  ? "bg-primary text-primary-foreground"
                  : "bg-destructive/20 text-destructive"
              }
            >
              {currentStep.decision.toUpperCase()}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-primary/50 text-primary">
              Step {stepIndex + 1} of {steps.length}
            </Badge>
          )}
          <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {flow.topology}
          </span>
        </div>
        <p
          id="flow-caption"
          className="text-sm leading-6 text-foreground"
          aria-live="polite"
        >
          {currentStep?.caption ?? "No flow steps available."}
        </p>
        <div
          className="flex flex-wrap gap-2"
          aria-label="Flow playback controls"
        >
          <Button
            type="button"
            onClick={() => setPlaying(true)}
            disabled={playing || stepIndex >= steps.length - 1}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Play
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setPlaying(false)}
            disabled={!playing}
            className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
          >
            Pause
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={goPrev}
            disabled={stepIndex <= 0}
            className="border-border hover:border-primary/70 hover:bg-primary/5"
          >
            Back
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={goNext}
            disabled={stepIndex >= steps.length - 1}
            className="border-border hover:border-primary/70 hover:bg-primary/5"
          >
            Next
          </Button>
          <span className="self-center text-xs text-muted-foreground">
            {stepIndex + 1} / {steps.length}
          </span>
        </div>
      </div>
    </section>
  );
}
