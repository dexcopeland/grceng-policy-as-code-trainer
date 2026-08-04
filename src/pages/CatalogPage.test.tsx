import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryBrowse } from "@/components/catalog/CategoryBrowse";
import { loadProgress, saveDrillProgress } from "@/lib/progress";
import { CatalogPage } from "./CatalogPage";

describe("CatalogPage", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("requires a framework and category before starting a drill", async () => {
    const onStart = vi.fn();
    render(<CatalogPage onStartDrill={onStart} />);

    expect(screen.getByRole("button", { name: /start drill/i })).toBeDisabled();
    expect(
      screen.getByText(/select at least one framework before starting/i),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("checkbox", { name: /nist/i }));
    expect(screen.getByRole("button", { name: /start drill/i })).toBeEnabled();

    await userEvent.click(
      screen.getByRole("button", { name: /select category/i }),
    );
    expect(screen.getByRole("button", { name: /start drill/i })).toBeDisabled();
    expect(
      screen.getByText(/choose a category or switch back to random mode/i),
    ).toBeInTheDocument();
  });

  it("clears stored progress from the progress strip", async () => {
    saveDrillProgress({
      controlId: "AC-2",
      title: "Account Management",
      frameworkIds: ["nist-800-53"],
      at: "2026-08-04T12:00:00.000Z",
    });

    render(<CatalogPage onStartDrill={() => {}} />);

    expect(screen.getByText("Account Management")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: /clear progress/i }),
    );

    expect(loadProgress().recentDrills).toEqual([]);
    expect(screen.queryByText("Account Management")).not.toBeInTheDocument();
    expect(
      screen.getByText(/start a drill to build your practice history/i),
    ).toBeInTheDocument();
  });

  it("suggests random mode or another framework when no categories match", () => {
    render(
      <CategoryBrowse
        categories={[]}
        selectedFrameworkIds={["nist-800-53"]}
        mode="random"
        onModeChange={() => {}}
        onCategoryChange={() => {}}
      />,
    );

    expect(screen.getByText(/no matching categories/i)).toBeInTheDocument();
    expect(
      screen.getByText(/try random mode or select a different framework set/i),
    ).toBeInTheDocument();
  });
});
