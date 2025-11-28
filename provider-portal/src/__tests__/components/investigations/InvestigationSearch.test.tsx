import { InvestigationSearch } from "@/components/investigations/InvestigationSearch";
import { fireEvent, render, screen } from "@testing-library/react";

describe("InvestigationSearch", () => {
  it("renders search UI and triggers search", () => {
    const onSelect = jest.fn();
    render(<InvestigationSearch onSelect={onSelect} />);

    expect(screen.getByText(/search investigations/i)).toBeInTheDocument();
    const searchInput = screen.getByPlaceholderText(/search by name/i);
    fireEvent.change(searchInput, { target: { value: "cbc" } });

    // Check that the input value changed
    expect(searchInput).toHaveValue("cbc");
  });
});
