import { ImmunizationHistory } from "@/features/encounter/components/history/ImmunizationHistory";
import { useEncounterStore } from "@/store/encounterStore";
import { fireEvent, render, screen } from "@testing-library/react";

describe("ImmunizationHistory (non-wizard)", () => {
  beforeEach(() => {
    // Reset immunization slice
    useEncounterStore.setState((state) => ({
      history: {
        ...state.history,
        immunizationHistory: [],
      },
    }));
  });

  it("renders heading", () => {
    render(<ImmunizationHistory />);
    expect(screen.getByText(/immunization history/i)).toBeInTheDocument();
  });

  it("adds an immunization entry", () => {
    render(<ImmunizationHistory />);

    const nameInput = screen.getByPlaceholderText(/vaccine name/i);
    fireEvent.change(nameInput, { target: { value: "Influenza" } });

    const addButton = screen.getByRole("button", { name: /add immunization/i });
    fireEvent.click(addButton);

    expect(screen.getByText(/influenza/i)).toBeInTheDocument();
  });
});
