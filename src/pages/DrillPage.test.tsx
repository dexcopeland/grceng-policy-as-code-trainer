import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { generateDrill } from "@/lib/generator";
import { loadProgress } from "@/lib/progress";
import { DrillPage } from "./DrillPage";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

const drill = generateDrill({
  frameworkIds: ["nist-800-53"],
  mode: "random",
  random: () => 0,
  now: new Date("2026-08-04T12:00:00Z"),
});

describe("DrillPage", () => {
  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("shows statement and rego side by side", () => {
    render(<DrillPage drill={drill} onBack={() => {}} />);

    expect(screen.getByText(drill.control.title)).toBeInTheDocument();
    expect(screen.getByText(/package/i)).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /control statement/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /policy as code/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tabpanel", { name: /flow/i })).toBeVisible();
    expect(screen.getByRole("tab", { name: /^flow$/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("renders flow playback controls on the default tab", () => {
    render(<DrillPage drill={drill} onBack={() => {}} />);

    expect(
      screen.getByRole("region", { name: /policy flow diagram/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^play$/i })).toBeInTheDocument();
    expect(screen.getByText(drill.flow.steps[0].caption)).toBeInTheDocument();
  });

  it("evaluates a scenario choice", async () => {
    render(<DrillPage drill={drill} onBack={() => {}} />);

    await userEvent.click(screen.getByRole("tab", { name: /evaluate/i }));
    const scenarioButton = screen.getByRole("button", {
      name: new RegExp(drill.scenarios[0].name, "i"),
    });
    await userEvent.click(scenarioButton);
    await userEvent.click(screen.getByRole("button", { name: /^deny$/i }));

    expect(screen.getByText(/matched clause/i)).toBeInTheDocument();
  });

  it("keeps the Flow deny stamp after leaving Evaluate and returning to Flow", async () => {
    const user = userEvent.setup();
    const denyScenario = drill.scenarios.find(
      (scenario) => scenario.expected === "deny",
    );
    expect(denyScenario).toBeDefined();
    const denyStep = drill.flow.steps.find(
      (step) => step.fixtureScenarioId === denyScenario!.id,
    );
    expect(denyStep).toBeDefined();

    render(<DrillPage drill={drill} onBack={() => {}} />);

    expect(screen.getByText(drill.flow.steps[0].caption)).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /evaluate/i }));
    await user.click(
      screen.getByRole("button", {
        name: new RegExp(denyScenario!.name, "i"),
      }),
    );
    await user.click(screen.getByRole("tab", { name: /^flow$/i }));

    expect(screen.getByText(denyStep!.caption)).toBeInTheDocument();
    expect(screen.getByText(/^deny$/i)).toBeInTheDocument();
    expect(
      screen.queryByText(drill.flow.steps[0].caption),
    ).not.toBeInTheDocument();
  });

  it("saves a quiz score and shows feedback", async () => {
    const user = userEvent.setup();
    render(<DrillPage drill={drill} onBack={() => {}} />);

    await user.click(screen.getByRole("tab", { name: /quiz/i }));
    const quizPanel = screen.getByRole("tabpanel", { name: /quiz/i });
    const firstQuestion = drill.quiz[0];
    await user.click(
      within(quizPanel).getByRole("radio", {
        name: firstQuestion.choices[firstQuestion.correctIndex],
      }),
    );
    await user.click(
      within(quizPanel).getByRole("button", { name: /submit quiz/i }),
    );

    expect(screen.getByText(/^correct$/i)).toBeInTheDocument();
    expect(loadProgress().quizScores).toEqual([
      expect.objectContaining({
        controlId: drill.control.id,
        score: 1,
        total: drill.quiz.length,
      }),
    ]);
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringMatching(/quiz score saved/i),
    );
  });
});
