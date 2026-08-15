# Policy flow (control plane / data plane)

**Date:** 2026-08-15  
**Status:** Approved for implementation planning  
**Applies to:** Drill Flow panel, `src/data/flows.json`, template families  

## Summary

After a trainee opens a drill, a Flow panel plays a short stepped diagram of that family's policy in action. It shows the control plane (who writes and serves the decision), the data plane (where the request or evidence travels), and the hardware/software that participates. The diagram is canned per template family, driven by the same fixture facts the mock evaluator already uses.

## Goals

- Teach where a policy decision actually happens (PEP asks PDP; or a scanner asks a baseline; or a review job scores an inventory).
- Keep the hop honest to the family. A 90-day access review is not a request-time gateway.
- Bind the animation to the same `input.*` facts as Evaluate, so Flow, Rego, and fixtures tell one story.
- Ship as static JSON + CSS/SVG. No live OPA, no connectors, no discovered inventory.

## Non-goals

- Live infra discovery or real PEP/PDP wiring
- Per-control unique topologies (controls that share a family share a flow)
- Auto-generating diagrams from Rego
- 3D, WebGL, or looping decorative GIFs
- Vendor-locked reference architectures (Okta-only, AWS-only)
- Showing `pacApplicability` in the UI

## Product decisions

| Topic | Decision |
| --- | --- |
| Flow placement | Fourth secondary tab on the drill, first in the list, default selected. Statement + Rego stay visible. |
| Key | `familyId` equals `templateId`. Parallel file `src/data/flows.json`, same pattern as fixtures. |
| Topology classes | Three: request-time, periodic-review, state-collector. Every family maps to exactly one. |
| Animation | Stepped story (4 to 6 steps), play / pause / next / prev. Not a loop. |
| Default scenario | Family's allow fixture. If Evaluate has a selected scenario, Flow can replay that allow/deny. |
| Hardware labels | Teaching examples on nodes (`software`), not inventory. |
| Motion | Respect `prefers-reduced-motion`: show the diagram and captions, no packet travel. |
| v1 completeness | Every existing template family ships a flow in the first implementation. Missing flow fails tests. |

## Topology classes

### Request-time

**Families:** `access-enforcement`, `authentication`, `boundary-protection`

- **Control plane:** policy author → Rego → PDP → supporting catalog (roles, MFA policy, or flow approvals)
- **Data plane:** subject → app or interface → PEP → resource
- **Decision hop:** PEP to PDP and back
- **Hardware/software examples:** IdP/SSO, workload, API gateway or firewall, OPA/PDP, target resource

### Periodic inventory / review

**Families:** `account-management`, `subject-identification`

- **Control plane:** review or identification rule → PDP (batch evaluator)
- **Data plane:** source of truth (IdP, CMDB, HR) → inventory export → review or identification job → register
- There is **no** request-time PEP on a user request path. The moving token is an export or inventory row, not a live API call.
- **Hardware/software examples:** IdP, HRIS/CMDB, review workflow or inventory job, owner or subject register

### State / collector

**Families:** `config-baseline`, `logging`, `audit-record-generation`, `flaw-remediation`

- **Control plane:** baseline / retention / event definition / SLA policy → PDP
- **Data plane:** asset or event source → collector or scanner → evaluator → store (config DB, SIEM, vuln tracker)
- The hop is collector to policy, not user to gateway.
- **Hardware/software examples:** host or app, scanner/agent/log shipper, policy engine, SIEM or vuln platform

## Data model

Proposed TypeScript shape for `src/data/flows.json` and drill composition:

```ts
export type FlowPlaneId = "control" | "data";
export type FlowTopology = "request-time" | "periodic-review" | "state-collector";
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
```

`familyId` must equal a `PolicyTemplate.id`. Drill composition adds `flow: PolicyFlow` to `Drill`.

## UI

- New `FlowPanel` beside Evidence / Evaluate / Quiz
- Tab order: Flow, Evidence, Evaluate, Quiz
- `defaultValue="flow"`
- Swimlanes: control plane on top (orange label), data plane below
- Decision edges drawn vertically between the PDP and the PEP or collector
- Controls: Play, Pause, Back, Next, step counter
- Caption under the diagram is the teaching sentence and the screen-reader source of truth
- If Evaluate selects a scenario whose id appears on a step, jump Flow to that step's decision

## Family map (v1)

Every existing template family ships exactly one flow. Implementers must use the nodes and paths below; do not invent alternate boxes.

### `access-enforcement` (reference family)

- **Topology:** `request-time`
- **Nodes:**
  - Policy author (control)
  - Rego (control)
  - PDP / OPA (control, software: OPA)
  - Role catalog (control)
  - User / service (data, software: IdP / SSO)
  - App (data, software: workload)
  - PEP (data, software: API gateway)
  - Resource (data)
- **Edges:** author → rego → pdp ← catalog; subject → app → pep → resource; pep ⇄ pdp (decision)
- **Steps:**
  1. Subject sends a request with role and action
  2. PEP intercepts
  3. PEP asks PDP with `input.request.*`
  4. PDP evaluates `authenticated`, `role_approved`, `action_allowed`
  5. ALLOW or DENY stamp at the PEP

### `authentication`

- **Topology:** `request-time`
- **Path:** user → IdP (PEP) → PDP (`unique_identity`, `mfa_satisfied`, `session_bound`) → session / app
- **Software examples:** IdP, MFA prompt, session token

### `boundary-protection`

- **Topology:** `request-time`
- **Path:** endpoint → managed interface (PEP / firewall) → PDP (`managed_interface`, `default_deny`, `flow_approved`, `flow_logged`) → destination
- **Software examples:** host, firewall / router, flow log

### `account-management`

- **Topology:** `periodic-review`
- **Path:** IdP export → review job → PDP (`active`, `owner`, `last_review_days`) → owner register
- Must **not** draw a live login PEP

### `subject-identification`

- **Topology:** `periodic-review`
- **Path:** IdP + process inventory + device CMDB → identification job → PDP (`users_identified`, `processes_identified`, `devices_identified`) → subject register

### `config-baseline`

- **Topology:** `state-collector`
- **Path:** asset → config scanner → PDP (`baseline_id`, `drift_count`, `approved_exception`) → baseline store

### `logging`

- **Topology:** `state-collector`
- **Path:** log source → collector → PDP (`enabled`, `retention_days`, `alerting`) → SIEM

### `audit-record-generation`

- **Topology:** `state-collector`
- **Path:** event source → record generator → PDP (`events_defined`, `records_generated`, `content_complete`) → audit store

### `flaw-remediation`

- **Topology:** `state-collector`
- **Path:** scanner → finding tracker → PDP (`tracked`, `severity`, `age_days`, `approved_exception`) → vuln platform

## Tests (implementation PR)

The later implementation PR must enforce:

- Every `templates[].id` has exactly one `flows[]` entry with matching `familyId`
- `topology` matches the family map above
- Every step `highlight`, `packet`, and edge endpoint is a known node or edge id
- Optional `fixtureScenarioId` exists on that family's fixtures
- Request-time families have a `kind: "decision"` edge between a data-plane enforcement node and a control-plane PDP
- Periodic-review and state-collector families must **not** include a request-time user → PEP → resource path
- DrillView default tab is `flow`
- Reduced-motion: no packet animation
- Generator attaches `drill.flow`

## Adding a family

When adding a new template family, author a flow in one of the three topology classes. Reusing a family reuses its flow. Do not invent a fourth topology without updating this spec.

## Success criteria

- Opening any drill shows Flow first, with statement + Rego still visible
- AC-6 (access-enforcement) plays the PEP/PDP hop and lands on the same allow/deny as Evaluate
- Account-management drills (for example AC-2, CIS-5.1) play an inventory/review job, not a gateway
- Every family has a flow; CI fails if one is missing
- App remains a static Pages app with no new backend

## Related

- Design spec: [`2026-08-04-policy-as-code-trainer-design.md`](2026-08-04-policy-as-code-trainer-design.md)
- Rubric: [`2026-08-15-pac-applicability-rubric.md`](2026-08-15-pac-applicability-rubric.md) (Flow does not change In / Stretch / Out)
- Adding a control: [`../recipes/adding-a-control.md`](../recipes/adding-a-control.md)
