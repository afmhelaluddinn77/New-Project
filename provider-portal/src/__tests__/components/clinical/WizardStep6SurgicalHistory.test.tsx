import { WizardStep6SurgicalHistory } from "@/features/clinical-documentation/WizardStep6SurgicalHistory";
import { useEncounterStore } from "@/store/encounterStore";
import { fireEvent, render, screen } from "@testing-library/react";

describe("WizardStep6SurgicalHistory", () => {
  beforeEach(() => {
    useEncounterStore.setState((state) => ({
      history: {
        ...state.history,
        surgicalHistory: [],
      },
    }));
  });

  it("allows quick add of a common surgery", () => {
    render(<WizardStep6SurgicalHistory />);

    // Quick-add chip is labeled "Appendectomy"
    const chip = screen.getByRole("button", { name: /appendectomy/i });
    fireEvent.click(chip);

    expect(screen.getByText(/recorded surgical history/i)).toBeInTheDocument();
    const matches = screen.getAllByText(/appendectomy/i);
    expect(matches.length).toBeGreaterThan(0);
  });
});
