import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CatalogPage } from "./CatalogPage";

describe("CatalogPage", () => {
  it("requires a framework before starting a drill", async () => {
    const onStart = vi.fn();
    render(<CatalogPage onStartDrill={onStart} />);

    expect(screen.getByRole("button", { name: /start drill/i })).toBeDisabled();
    await userEvent.click(screen.getByRole("checkbox", { name: /nist/i }));
    expect(screen.getByRole("button", { name: /start drill/i })).toBeEnabled();
  });
});
