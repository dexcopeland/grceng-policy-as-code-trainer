# Agent notes

When adding or remapping **controls, templates, or fixture families**, follow:

1. [Policy-as-code applicability rubric](docs/superpowers/specs/2026-08-15-pac-applicability-rubric.md) — score In / Stretch / Out before writing JSON.
2. [Adding a control](docs/superpowers/recipes/adding-a-control.md) — recipe for data + lock-in tests.
3. [Policy flow](docs/superpowers/specs/2026-08-15-policy-flow.md) — when adding a **new** template/fixture family, also author a flow in the matching topology class (`request-time`, `periodic-review`, or `state-collector`). Reusing a family reuses its flow.

Do not add Out controls to the catalog. Unrelated UI or bug-fix work does not need the rubric.
