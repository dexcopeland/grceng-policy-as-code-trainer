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
    expect(screen.getByRole("tabpanel", { name: /evidence/i })).toBeVisible();
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
