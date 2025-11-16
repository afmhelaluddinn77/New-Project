import { WizardStep7ObgynHistory } from "@/features/clinical-documentation/WizardStep7ObgynHistory";
import { useEncounterStore } from "@/store/encounterStore";
import { fireEvent, render, screen } from "@testing-library/react";

describe("WizardStep7ObgynHistory", () => {
  beforeEach(() => {
    // Reset OB/GYN slice to a clean state for each test
    useEncounterStore.setState((state) => ({
      history: {
        ...state.history,
        obgynHistory: { obstetric: {}, gynecologic: {} },
      },
    }));
  });

  it("allows quick add of a common gynecologic condition", () => {
    render(<WizardStep7ObgynHistory />);

    const chip = screen.getByRole("button", { name: /endometriosis/i });
    fireEvent.click(chip);

    expect(screen.getByText(/gynecologic conditions/i)).toBeInTheDocument();
    const matches = screen.getAllByText(/endometriosis/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("allows adding a custom gynecologic condition", () => {
    render(<WizardStep7ObgynHistory />);

    const input = screen.getByPlaceholderText(
      /add custom gynecologic condition/i
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "Chronic pelvic pain" } });
    fireEvent.keyDown(input, { key: "Enter" });

    const matches = screen.getAllByText(/chronic pelvic pain/i);
    expect(matches.length).toBeGreaterThan(0);
  });
});
