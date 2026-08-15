# Adding a control

Use this recipe when adding or remapping a control, template, or fixture family. Unrelated UI/bug-fix PRs can skip it.

## 1. Score first

Apply the [policy-as-code applicability rubric](../specs/2026-08-15-pac-applicability-rubric.md).

| Verdict | Action |
| --- | --- |
| **In** | Proceed — dedicate or reuse a family that teaches this control honestly. |
| **Stretch** | Proceed only if the simplified drill still teaches a useful pattern (do not invent a fake family). |
| **Out** | Stop. Do not add it to `controls.json`. |

Record the score on the control as `pacApplicability` (`"in"` | `"stretch"`) and a short `pacRationale`. Tests reject missing scores and reject `"out"`.

## 2. Prefer a control-faithful family

Follow the PR #6 / #7 style:

- Map the control to a template/fixture family whose Rego, facts, and quiz match the control objective.
- If the objective does not fit an existing family, add a dedicated family (as with `audit-record-generation` for AU-12 and `subject-identification` for IA.L2-3.5.1).
- Do not leave a tagged category×framework cell empty by shipping a mismatched family just to enable the button.

## 3. Add data

Update, as needed:

1. `src/data/controls.json` — control with `pacApplicability` + `pacRationale`
2. `src/data/templates.json` — statement, Rego, annotations, evidence, quiz seeds
3. `src/data/fixtures.json` — allow and deny scenarios with realistic facts
4. `src/data/categories.json` — only if a new category is required

Keep sample depth. Do not expand into an exhaustive catalog.

## 4. Lock in with tests

Extend `src/data/data.test.ts` (and generator/evaluator tests when behavior changes) so the new mapping cannot silently regress:

- Expected `templateId` / `fixtureFamilyId` pairing
- Rego clauses that distinguish this family from a generic reuse
- Allow/deny fixture expectations that match the written rule
- Tagged category×framework visibility, when that is why the control was added

## 5. Verify

```bash
npm test
npm run lint
npm run build
```

Spot-check the new drill in the UI: statement, Rego, evidence, evaluate allow/deny, and quiz should all teach the same rule.
