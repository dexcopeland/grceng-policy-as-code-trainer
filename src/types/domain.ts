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
}
