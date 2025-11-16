import { encounterService } from "../../services/encounterService";

// Build a lightweight mock axios-like client the service can use
const mockClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  defaults: { headers: { common: {} } },
};

describe("EncounterService - Additional function coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.get.mockReset();
    mockClient.post.mockReset();
    mockClient.put.mockReset();
    mockClient.patch.mockReset();
    mockClient.delete.mockReset();
    // Inject mock client into service instance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (encounterService as any)["client"] = mockClient;
  });

  it("listPrescriptions should return data", async () => {
    const data = [{ id: "rx-1" }];
    mockClient.get.mockResolvedValue({ data });
    const res = await encounterService.listPrescriptions();
    expect(res).toEqual(data);
  });

  it("listInvestigations should return data", async () => {
    const data = [{ id: "inv-1" }];
    mockClient.get.mockResolvedValue({ data });
    const res = await encounterService.listInvestigations();
    expect(res).toEqual(data);
  });

  it("getAllEncounters should pass pagination params and return data", async () => {
    const data = [{ id: "enc-1" }];
    mockClient.get.mockResolvedValue({ data });
    const res = await encounterService.getAllEncounters(0, 10);
    expect(res).toEqual(data);
    expect(mockClient.get).toHaveBeenCalledWith("/api/encounters", {
      params: { skip: 0, take: 10 },
    });
  });

  it("getMedicationByRxNorm should return data", async () => {
    const data = { id: "med-1", rxNormCode: "123" };
    mockClient.get.mockResolvedValue({ data });
    const res = await encounterService.getMedicationByRxNorm("123");
    expect(res).toEqual(data);
    expect(mockClient.get).toHaveBeenCalled();
  });

  it("healthCheck should return ok", async () => {
    const data = { status: "ok" };
    mockClient.get.mockResolvedValue({ data });
    const res = await encounterService.healthCheck();
    expect(res).toEqual(data);
  });
});
