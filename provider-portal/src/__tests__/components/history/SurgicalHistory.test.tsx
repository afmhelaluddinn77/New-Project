import { SurgicalHistory } from "@/features/encounter/components/history/SurgicalHistory";
import { useEncounterStore } from "@/store/encounterStore";
import { fireEvent, render, screen } from "@testing-library/react";

describe("SurgicalHistory (non-wizard)", () => {
  beforeEach(() => {
    // Reset just the surgicalHistory slice to avoid cross-test pollution
    useEncounterStore.setState((state) => ({
      history: {
        ...state.history,
        surgicalHistory: [],
      },
    }));
  });

  it("renders heading", () => {
    render(<SurgicalHistory />);
    const heading = screen.getByRole("heading", {
      name: /surgical history/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it("adds a surgery to the list", () => {
    render(<SurgicalHistory />);

    const procedureInput = screen.getByPlaceholderText(/procedure/i);
    fireEvent.change(procedureInput, { target: { value: "Appendectomy" } });

    const addButton = screen.getByRole("button", { name: /add surgery/i });
    fireEvent.click(addButton);

    expect(screen.getByText(/appendectomy/i)).toBeInTheDocument();
  });
});
