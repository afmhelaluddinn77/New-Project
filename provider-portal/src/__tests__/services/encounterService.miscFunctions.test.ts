import { encounterService } from "../../services/encounterService";

const mockClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  defaults: { headers: { common: {} } },
};

describe("EncounterService - Misc functions coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.get.mockReset();
    mockClient.post.mockReset();
    mockClient.put.mockReset();
    mockClient.patch.mockReset();
    mockClient.delete.mockReset();
    (encounterService as any)["client"] = mockClient as any;
  });

  // setAuthToken is deprecated but kept for backward compatibility
  it("setAuthToken logs deprecation warning", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    encounterService.setAuthToken("token-123");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("setAuthToken is deprecated")
    );
    consoleSpy.mockRestore();
  });

  it("updateInvestigation should PUT and return data", async () => {
    const data = { id: "inv-1", status: "COMPLETED" };
    mockClient.put.mockResolvedValue({ data });
    const res = await encounterService.updateInvestigation("inv-1", {
      status: "COMPLETED",
    });
    expect(res).toEqual(data);
    expect(mockClient.put).toHaveBeenCalled();
  });

  it("deleteInvestigation should DELETE and return data", async () => {
    const data = { ok: true };
    mockClient.delete.mockResolvedValue({ data });
    const res = await encounterService.deleteInvestigation("inv-1");
    expect(res).toEqual(data);
    expect(mockClient.delete).toHaveBeenCalled();
  });

  it("searchInvestigationBySnomed should GET and return data", async () => {
    const data = [{ id: "inv-2", snomedCode: "123456" }];
    mockClient.get.mockResolvedValue({ data });
    const res = await encounterService.searchInvestigationBySnomed("123456");
    expect(res).toEqual(data);
    expect(mockClient.get).toHaveBeenCalled();
  });
});
