import { StrictMode } from "react";
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

const allowStep = drill.flow.steps.find(
  (step) => step.fixtureScenarioId === allowId,
);
const denyStep = drill.flow.steps.find(
  (step) => step.fixtureScenarioId === denyId,
);

describe("FlowPanel", () => {
  it("starts on the first teaching step for the allow scenario", () => {
    render(
      <FlowPanel
        drill={drill}
        selectedScenarioId={allowId}
        userPickedScenario={false}
      />,
    );
    expect(screen.getByText(drill.flow.steps[0].caption)).toBeInTheDocument();
    expect(screen.getAllByText(/request-time/i).length).toBeGreaterThan(0);
  });

  it("keeps the first teaching step under Strict Mode with the allow scenario", () => {
    render(
      <StrictMode>
        <FlowPanel
          drill={drill}
          selectedScenarioId={allowId}
          userPickedScenario={false}
        />
      </StrictMode>,
    );
    expect(screen.getByText(drill.flow.steps[0].caption)).toBeInTheDocument();
    expect(allowStep).toBeDefined();
    expect(screen.queryByText(allowStep!.caption)).not.toBeInTheDocument();
  });

  it("jumps to the deny decision when Evaluate selects that scenario", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <FlowPanel
        drill={drill}
        selectedScenarioId={allowId}
        userPickedScenario={false}
      />,
    );
    await user.click(screen.getByRole("button", { name: /^next$/i }));
    rerender(
      <FlowPanel
        drill={drill}
        selectedScenarioId={denyId}
        userPickedScenario={true}
      />,
    );
    expect(denyStep).toBeDefined();
    expect(screen.getByText(denyStep!.caption)).toBeInTheDocument();
    expect(screen.getByText(/^deny$/i)).toBeInTheDocument();
  });

  it("lands on DENY when remounted after the user picked a deny scenario", () => {
    const { unmount } = render(
      <FlowPanel
        drill={drill}
        selectedScenarioId={denyId}
        userPickedScenario={true}
      />,
    );
    expect(denyStep).toBeDefined();
    expect(screen.getByText(denyStep!.caption)).toBeInTheDocument();
    expect(screen.getByText(/^deny$/i)).toBeInTheDocument();

    unmount();
    render(
      <FlowPanel
        drill={drill}
        selectedScenarioId={denyId}
        userPickedScenario={true}
      />,
    );
    expect(screen.getByText(denyStep!.caption)).toBeInTheDocument();
    expect(screen.getByText(/^deny$/i)).toBeInTheDocument();
    expect(
      screen.queryByText(drill.flow.steps[0].caption),
    ).not.toBeInTheDocument();
  });

  it("stays on the first teaching step when remounted with default allow and no user pick", () => {
    const { unmount } = render(
      <FlowPanel
        drill={drill}
        selectedScenarioId={allowId}
        userPickedScenario={false}
      />,
    );
    expect(screen.getByText(drill.flow.steps[0].caption)).toBeInTheDocument();

    unmount();
    render(
      <FlowPanel
        drill={drill}
        selectedScenarioId={allowId}
        userPickedScenario={false}
      />,
    );
    expect(screen.getByText(drill.flow.steps[0].caption)).toBeInTheDocument();
    expect(allowStep).toBeDefined();
    expect(screen.queryByText(allowStep!.caption)).not.toBeInTheDocument();
  });

  it("places plane titles in a header row above each swimlane", () => {
    const { container } = render(
      <FlowPanel
        drill={drill}
        selectedScenarioId={allowId}
        userPickedScenario={false}
      />,
    );

    const controlTitle = container.querySelector(
      '[data-plane-label="control"]',
    );
    const dataTitle = container.querySelector('[data-plane-label="data"]');
    expect(controlTitle).toHaveAttribute("data-title-slot", "header-row");
    expect(dataTitle).toHaveAttribute("data-title-slot", "header-row");

    const controlLaneY = Number(
      container
        .querySelector('[data-plane="control"]')
        ?.getAttribute("data-lane-y"),
    );
    const dataLaneY = Number(
      container
        .querySelector('[data-plane="data"]')
        ?.getAttribute("data-lane-y"),
    );
    const controlTitleY = Number(controlTitle?.getAttribute("y"));
    const dataTitleY = Number(dataTitle?.getAttribute("y"));

    // Titles must sit above the node boxes (center ± half height).
    expect(controlTitleY).toBeLessThan(controlLaneY - 26);
    expect(dataTitleY).toBeLessThan(dataLaneY - 26);
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
      <FlowPanel
        drill={drill}
        selectedScenarioId={allowId}
        userPickedScenario={false}
      />,
    );
    expect(container.querySelector(".flow-packet")).toBeNull();
    vi.unstubAllGlobals();
  });
});
