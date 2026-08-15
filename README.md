# Policy-as-Code Trainer

A static GitHub Pages app for practicing policy-as-code concepts from a GRC perspective. Users select control frameworks, generate a drill, compare the human control statement with annotated Rego, review evidence guidance, mock-evaluate canned scenarios, and take quizzes with progress saved in `localStorage`.

The implementation uses Vite, React, TypeScript, Tailwind CSS, shadcn/ui-style components, and Vitest. The visual theme is a dark black/orange/white interface with light code blocks for Rego examples.

## Framework coverage

The trainer includes lightweight sample coverage for:

- NIST SP 800-53 (AC, AU, CM, IA, SC, and SI family samples)
- Secure Controls Framework (SCF) (identity, monitoring, and configuration samples)
- CIS Controls (audit logging and account inventory samples)
- SOC 2 Trust Services Criteria
- SOX IT General Controls
- FedRAMP Rev. 5 (event logging and least privilege samples)
- FedRAMP 20x (continuous configuration and identity evidence samples)
- Cybersecurity Maturity Model Certification (CMMC) (access and identity samples)

Coverage is sample-depth, not exhaustive. New controls must pass the [policy-as-code applicability rubric](docs/superpowers/specs/2026-08-15-pac-applicability-rubric.md) (In / Stretch / Out) before they are added. See the [adding a control](docs/superpowers/recipes/adding-a-control.md) recipe.

## Local development

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Build the static site:

```bash
npm run build
```

The Vite base path is configured as `/grceng-policy-as-code-trainer/` so built assets work from the repository GitHub Pages URL.

## GitHub Pages deployment

The workflow in `.github/workflows/deploy.yml` builds, tests, uploads `dist/`, and deploys with GitHub Pages Actions.

**Required before the first successful deploy:** GitHub Pages must be enabled for this repository. Until that is done, the `build` job can pass while `deploy` fails with `Failed to create deployment (status: 404)`.

Repository setup:

1. In GitHub, open **Settings → Pages**: https://github.com/dexcopeland/grceng-policy-as-code-trainer/settings/pages
2. Set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. Re-run the failed **Deploy to GitHub Pages** workflow (Actions → failed run → **Re-run failed jobs**), or push to `main` / use **workflow_dispatch**.

After deployment, the site is available at:

```text
https://dexcopeland.github.io/grceng-policy-as-code-trainer/
```

### Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `deploy` fails with Pages `404` / “Ensure GitHub Pages has been enabled” | Pages site not created / source not set to GitHub Actions | Enable Pages as above, then re-run the workflow |
| `build` fails on `npm test` / `npm run build` | App code or dependency issue | Reproduce locally with `npm ci && npm test && npm run build` |

## Design reference

- Design spec: [`docs/superpowers/specs/2026-08-04-policy-as-code-trainer-design.md`](docs/superpowers/specs/2026-08-04-policy-as-code-trainer-design.md)
- PaC applicability rubric: [`docs/superpowers/specs/2026-08-15-pac-applicability-rubric.md`](docs/superpowers/specs/2026-08-15-pac-applicability-rubric.md)
- Adding a control: [`docs/superpowers/recipes/adding-a-control.md`](docs/superpowers/recipes/adding-a-control.md)