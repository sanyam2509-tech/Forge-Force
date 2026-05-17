interface Step {
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "1",
    title: "Describe Your Event",
    description:
      "Enter your event details, audience, goals, and vibe. The more context, the better the output.",
  },
  {
    number: "2",
    title: "AI Generates Everything",
    description:
      "Our AI creates a complete operational workspace with briefs, checklists, timelines, and content.",
  },
  {
    number: "3",
    title: "Execute With Confidence",
    description:
      "Use your generated workspace to plan, communicate, and execute your event flawlessly.",
  },
];

export function WorkflowSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          How It Works
        </h2>

        <div className="relative mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
          {/* Dashed connector line — hidden on mobile */}
          <div
            className="pointer-events-none absolute top-5 right-[calc(16.67%+20px)] left-[calc(16.67%+20px)] hidden border-t-2 border-dashed border-border/60 md:block"
            aria-hidden="true"
          />

          {steps.map((step) => (
            <div
              key={step.number}
              className="relative flex flex-col items-center text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {step.number}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
