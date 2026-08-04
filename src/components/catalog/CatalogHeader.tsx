export function CatalogHeader() {
  return (
    <header className="flex flex-col gap-3">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
        Policy-as-Code Trainer
      </p>
      <div className="flex max-w-3xl flex-col gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-primary md:text-6xl">
          Practice controls as executable policy.
        </h1>
        <p className="text-base leading-7 text-muted-foreground md:text-lg">
          Browse frameworks, pick a control category, and start a drill that
          turns compliance intent into Rego, evidence queries, and quiz prompts.
        </p>
      </div>
    </header>
  );
}
