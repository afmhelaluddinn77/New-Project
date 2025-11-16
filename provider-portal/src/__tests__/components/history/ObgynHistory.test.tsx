import { ObgynHistory } from "@/features/encounter/components/history/ObgynHistory";
import { useEncounterStore } from "@/store/encounterStore";
import { fireEvent, render, screen } from "@testing-library/react";

describe("ObgynHistory (non-wizard)", () => {
  beforeEach(() => {
    // Reset OB/GYN slice
    useEncounterStore.setState((state) => ({
      history: {
        ...state.history,
        obgynHistory: { obstetric: {}, gynecologic: {} },
      },
    }));
  });

  it("renders heading", () => {
    render(<ObgynHistory />);
    expect(screen.getByText(/ob\/gyn history/i)).toBeInTheDocument();
  });

  it("updates obstetric values", () => {
    render(<ObgynHistory />);

    const gravidaInput = screen.getByLabelText(/gravida/i) as HTMLInputElement;
    fireEvent.change(gravidaInput, { target: { value: "2" } });

    expect(gravidaInput.value).toBe("2");
  });
});
