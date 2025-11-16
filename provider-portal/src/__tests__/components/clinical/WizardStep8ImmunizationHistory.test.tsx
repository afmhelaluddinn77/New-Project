import { WizardStep8ImmunizationHistory } from "@/features/clinical-documentation/WizardStep8ImmunizationHistory";
import { useEncounterStore } from "@/store/encounterStore";
import { fireEvent, render, screen } from "@testing-library/react";

describe("WizardStep8ImmunizationHistory", () => {
  beforeEach(() => {
    // Reset immunization slice to a clean state for each test
    useEncounterStore.setState((state) => ({
      history: {
        ...state.history,
        immunizationHistory: [],
      },
    }));
  });

  it("allows quick add of a common vaccine", () => {
    render(<WizardStep8ImmunizationHistory />);

    const chip = screen.getByRole("button", { name: /influenza/i });
    fireEvent.click(chip);

    expect(screen.getByText(/recorded immunizations/i)).toBeInTheDocument();
    const matches = screen.getAllByText(/influenza/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("allows adding a custom vaccine", () => {
    render(<WizardStep8ImmunizationHistory />);

    const nameInput = screen.getByPlaceholderText(/vaccine name/i);
    fireEvent.change(nameInput, { target: { value: "BCG" } });

    const addButton = screen.getByRole("button", { name: /add vaccine/i });
    fireEvent.click(addButton);

    const matches = screen.getAllByText(/bcg/i);
    expect(matches.length).toBeGreaterThan(0);
  });
});
