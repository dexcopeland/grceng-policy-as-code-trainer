import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlowPanel } from "@/components/drill/FlowPanel";
import { generateDrill } from "@/lib/generator";

const drill = generateDrill({
  frameworkIds: ["fedramp-rev5"],
  mode: "category",
  categoryId: "access-control",
  random: () => 0,
  now: new Date("2026-08-04T12:00:00Z"),
});

const allowId =
  drill.scenarios.find((scenario) => scenario.expected === "allow")?.id ?? "";
const denyId =
  drill.scenarios.find((scenario) => scenario.expected === "deny")?.id ?? "";

describe("FlowPanel", () => {
  it("starts on the first teaching step for the allow scenario", () => {
    render(<FlowPanel drill={drill} selectedScenarioId={allowId} />);
    expect(screen.getByText(drill.flow.steps[0].caption)).toBeInTheDocument();
    expect(screen.getAllByText(/request-time/i).length).toBeGreaterThan(0);
  });

  it("jumps to the deny decision when Evaluate selects that scenario", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <FlowPanel drill={drill} selectedScenarioId={allowId} />,
    );
    await user.click(screen.getByRole("button", { name: /^next$/i }));
    rerender(<FlowPanel drill={drill} selectedScenarioId={denyId} />);
    const denyStep = drill.flow.steps.find(
      (step) => step.fixtureScenarioId === denyId,
    );
    expect(denyStep).toBeDefined();
    expect(screen.getByText(denyStep!.caption)).toBeInTheDocument();
    expect(screen.getByText(/^deny$/i)).toBeInTheDocument();
  });

  it("hides packet travel when prefers-reduced-motion is set", () => {
    const matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    }));
    vi.stubGlobal("matchMedia", matchMedia);

    const { container } = render(
      <FlowPanel drill={drill} selectedScenarioId={allowId} />,
    );
    expect(container.querySelector(".flow-packet")).toBeNull();
    vi.unstubAllGlobals();
  });
});
