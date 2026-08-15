export type FrameworkId =
  | "nist-800-53"
  | "scf"
  | "cis"
  | "soc2"
  | "sox-itgc"
  | "fedramp-rev5"
  | "fedramp-20x"
  | "cmmc";

export interface Framework {
  id: FrameworkId;
  name: string;
  versionLabel: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  frameworkIds: FrameworkId[];
}

/** Policy-as-code applicability score. Out controls are never stored in the catalog. */
export type PacApplicability = "in" | "stretch";

export interface Control {
  id: string;
  frameworkId: FrameworkId;
  categoryId: string;
  title: string;
  objective: string;
  keywords: string[];
  relatedFrameworkIds?: FrameworkId[];
  templateId: string;
  fixtureFamilyId: string;
  /** Rubric score from docs/superpowers/specs/2026-08-15-pac-applicability-rubric.md */
  pacApplicability: PacApplicability;
  /** Short rationale for the In/Stretch score (why this control can be taught as PaC). */
  pacRationale: string;
}

export interface PolicyTemplate {
  id: string;
  statementTemplate: string; // uses {{title}}, {{objective}}, {{controlId}}
  regoTemplate: string; // uses {{packageName}}, {{controlId}}
  annotations: Array<{ label: string; detail: string }>;
  evidence: {
    artifacts: string[];
    queryTemplate: string; // uses {{start}}, {{end}}, {{controlId}}
  };
  quizSeeds: Array<{
    question: string;
    choices: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

export interface EvalFixture {
  familyId: string;
  scenarios: Array<{
    id: string;
    name: string;
    facts: Record<string, unknown>;
    expected: "allow" | "deny";
    explanation: string;
    matchedClause: string;
  }>;
}

export type FlowPlaneId = "control" | "data";
export type FlowTopology =
  | "request-time"
  | "periodic-review"
  | "state-collector";
export type FlowDecision = "allow" | "deny";

export interface FlowNode {
  id: string;
  label: string;
  plane: FlowPlaneId;
  software?: string;
}

export interface FlowEdge {
  id: string;
  from: string;
  to: string;
  kind: "control" | "data" | "decision";
  label?: string;
}

export interface FlowStep {
  id: string;
  caption: string;
  highlight: string[];
  packet?: { from: string; to: string };
  decision?: FlowDecision;
  fixtureScenarioId?: string;
}

export interface PolicyFlow {
  familyId: string;
  topology: FlowTopology;
  planes: Array<{ id: FlowPlaneId; label: string }>;
  nodes: FlowNode[];
  edges: FlowEdge[];
  steps: FlowStep[];
}

export interface Drill {
  control: Control;
  frameworks: Framework[];
  category: Category;
  statement: string;
  rego: string;
  annotations: Array<{ label: string; detail: string }>;
  evidence: {
    artifacts: string[];
    query: string;
    window: { start: string; end: string };
  };
  scenarios: EvalFixture["scenarios"];
  quiz: PolicyTemplate["quizSeeds"];
  flow: PolicyFlow;
}
