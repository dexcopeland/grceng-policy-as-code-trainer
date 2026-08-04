# Task 2 Report: Domain types and static datasets

## Status

DONE

## TDD Evidence

### RED

Command:

```bash
npm test -- src/data/data.test.ts
```

Result: FAIL as expected before implementation.

Evidence:

```text
FAIL  src/data/data.test.ts [ src/data/data.test.ts ]
Error: Failed to resolve import "./index" from "src/data/data.test.ts". Does the file exist?
```

### GREEN

Command:

```bash
npm test -- src/data/data.test.ts
```

Result: PASS.

Evidence:

```text
Test Files  1 passed (1)
Tests  3 passed (3)
```

## Additional Verification

Command:

```bash
npm test
```

Result:

```text
Test Files  2 passed (2)
Tests  4 passed (4)
```

Command:

```bash
npm run build
```

Result: PASS; TypeScript build and Vite production build completed successfully.

Note: Vite emitted an existing warning about `__dirname` in `vite.config.ts` and future `configLoader: 'native'` behavior. This task did not modify `vite.config.ts`.

## Files Changed

- `src/types/domain.ts`
- `src/data/data.test.ts`
- `src/data/frameworks.json`
- `src/data/categories.json`
- `src/data/controls.json`
- `src/data/templates.json`
- `src/data/fixtures.json`
- `src/data/index.ts`
- `tsconfig.app.json`
- `.superpowers/sdd/task-2-report.md`

## Implementation Summary

- Added the exact domain types from the task brief, including `FrameworkId`, `Framework`, `Category`, `Control`, `PolicyTemplate`, `EvalFixture`, and `Drill`.
- Added all eight requested frameworks:
  - `nist-800-53`
  - `scf`
  - `cis`
  - `soc2`
  - `sox-itgc`
  - `fedramp-rev5`
  - `fedramp-20x`
  - `cmmc`
- Added the required stable category ids:
  - `access-control`
  - `audit-accountability`
  - `configuration-management`
  - `identity-access`
- Added eight controls, one per framework.
- Added the required template and fixture families:
  - `account-management`
  - `logging`
  - `config-baseline`
- Added at least two scenarios per fixture family, with allow and deny coverage.
- Enabled `resolveJsonModule` in `tsconfig.app.json`.

## Self-Review

- Verified every control references known framework, category, template, and fixture ids through the dataset integrity test.
- Verified the framework id list exactly matches the brief's expected eight ids.
- Kept data generation and UI behavior out of scope for Task 2.
- Used JSON datasets and typed exports through `src/data/index.ts` to preserve the expected import surface for later tasks.
- Checked for accidental TODO/FIXME/debug logging in `src/data`; none found.

## Concerns

- No blocking concerns.
- Existing Vite warning about `__dirname` remains outside this task's scope.
