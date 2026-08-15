# Policy-as-code applicability rubric

**Date:** 2026-08-15  
**Status:** Authoritative for catalog content decisions  
**Applies to:** Adding or remapping controls, templates, or fixture families  

This trainer is sample-depth, not exhaustive. Do not add a control just to fill a category button. A control belongs in the catalog only if it can be taught as policy-as-code.

## Verdicts

A control is **In** if we can name the facts, write a real allow and a real deny, point at queryable evidence, and teach a pattern we do not already have.

It is **Stretch** if we can only do that by simplifying the control into an existing template/fixture family.

It is **Out** if the honest answer is a document, a meeting, or a named role. Out never becomes a drill.

## Five tests (all required for In)

1. **Facts.** You can write `input.*` fields a mock evaluator could score. "Has an account owner" works. "Leadership is committed" does not.
2. **Decision.** Both allow and deny are realistic, and they match the written rule. (SI-2 lesson: an allow path must not contradict the written SLA.)
3. **Evidence.** There is an artifact plus a time-bounded query that could return those facts (export, log, config snapshot, ticket). Interviews and annual attestations are out.
4. **Distinct pattern.** The Rego teaches something the current families do not. AU-12 failed this when it reused generic `logging` for record generation. FR20X-IA-01 is Stretch today: "continuous identity evidence" is still owner + 90-day review.
5. **One-drill teachable.** A trainee can learn the clauses in one statement/Rego/quiz pass. Composite "implement the whole family" controls get split or stay Out.

## Usage

1. Score a framework (or candidate control) with this rubric.
2. Build only **In** controls into the catalog by default.
3. Build **Stretch** only when it teaches something useful even after the simplification (for example, filling a tagged category cell without inventing a dishonest family).
4. Never add **Out** just to fill a tagged category.

Catalog encoding: every control in `src/data/controls.json` must record `pacApplicability` as `"in"` or `"stretch"` plus a short `pacRationale`. Do not add Out controls to the JSON.

## Scope

This rubric applies when adding or remapping controls, templates, or fixture families. It does not apply to unrelated UI or bug-fix PRs.

## Related

- Adding-a-control recipe: [`../recipes/adding-a-control.md`](../recipes/adding-a-control.md)
- Design spec coverage / content production: [`2026-08-04-policy-as-code-trainer-design.md`](2026-08-04-policy-as-code-trainer-design.md)
