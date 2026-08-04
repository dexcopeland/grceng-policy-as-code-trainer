# Policy-as-Code Trainer

A static GitHub Pages app for practicing policy-as-code concepts from a GRC perspective. Users select control frameworks, generate a drill, compare the human control statement with annotated Rego, review evidence guidance, mock-evaluate canned scenarios, and take quizzes with progress saved in `localStorage`.

The implementation uses Vite, React, TypeScript, Tailwind CSS, shadcn/ui-style components, and Vitest. The visual theme is a dark black/orange/white interface with light code blocks for Rego examples.

## Framework coverage

The trainer includes lightweight sample coverage for:

- NIST SP 800-53
- Secure Controls Framework (SCF)
- CIS Controls
- SOC 2 Trust Services Criteria
- SOX IT General Controls
- FedRAMP Rev. 5
- FedRAMP 20x
- Cybersecurity Maturity Model Certification (CMMC)

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

Repository setup:

1. In GitHub, open **Settings > Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push to `main` or run the **Deploy to GitHub Pages** workflow manually.

After deployment, the site is available at:

```text
https://<user>.github.io/grceng-policy-as-code-trainer/
```

## Design reference

See the approved design spec: [`docs/superpowers/specs/2026-08-04-policy-as-code-trainer-design.md`](docs/superpowers/specs/2026-08-04-policy-as-code-trainer-design.md).