/**
 * Smoke Tests for EncounterService - Prescription, Investigation, Medication APIs
 * These tests verify basic functionality of new endpoints.
 * Note: Requires Jest or similar test runner with mocking support.
 */

import axios from "axios";

// Mock axios
jest.mock("axios");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedAxios = axios as any;

// Provide a mock axios client compatible with axios.create()
const mockClient = {
  post: jest.fn(),
  get: jest.fn(),
  patch: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  defaults: { headers: { common: {} } },
};

import { encounterService } from "../../services/encounterService";

describe("EncounterService - Smoke Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock client methods and inject into service
    mockClient.post.mockReset();
    mockClient.get.mockReset();
    mockClient.patch.mockReset();
    mockClient.put.mockReset();
    mockClient.delete.mockReset();
    // Ensure EncounterService uses the mock client
    (encounterService as any)["client"] = mockClient as any;
  });

  describe("Prescription APIs", () => {
    it("should create a prescription", async () => {
      const mockPrescription = {
        id: "rx-123",
        encounterId: "enc-456",
        genericName: "Aspirin",
        dosage: "500mg",
        dosageForm: "tablet",
        route: "oral",
        frequency: "BID",
        duration: "7 days",
        quantity: 14,
        status: "ACTIVE",
      };

      // Mock the API call
      mockClient.post.mockResolvedValue({ data: mockPrescription });

      const result = await encounterService.createPrescription({
        encounterId: "enc-456",
        genericName: "Aspirin",
        dosage: "500mg",
        dosageForm: "tablet",
        route: "oral",
        frequency: "BID",
        duration: "7 days",
        quantity: 14,
      });

      expect(result).toEqual(mockPrescription);
      expect(result.id).toBe("rx-123");
    });

    it("should fetch prescriptions by encounter", async () => {
      const mockPrescriptions = [
        {
          id: "rx-1",
          encounterId: "enc-456",
          genericName: "Aspirin",
          status: "ACTIVE",
        },
        {
          id: "rx-2",
          encounterId: "enc-456",
          genericName: "Ibuprofen",
          status: "ACTIVE",
        },
      ];

      mockClient.get.mockResolvedValue({ data: mockPrescriptions });

      const result =
        await encounterService.getPrescriptionsByEncounter("enc-456");

      expect(result).toHaveLength(2);
      expect(result[0].genericName).toBe("Aspirin");
    });

    it("should dispense a prescription", async () => {
      const mockDispensed = {
        id: "rx-123",
        status: "COMPLETED",
        dispensedDate: new Date().toISOString(),
      };

      mockClient.post.mockResolvedValue({ data: mockDispensed });

      const result = await encounterService.dispensePrescription("rx-123", {
        pharmacyId: "pharm-789",
      });

      expect(result.status).toBe("COMPLETED");
    });

    it("should check prescription interactions", async () => {
      const mockInteractions = {
        prescriptionId: "rx-123",
        interactions: [],
        checkedAt: new Date().toISOString(),
      };

      mockClient.post.mockResolvedValue({ data: mockInteractions });

      const result = await encounterService.checkPrescriptionInteractions(
        "rx-123",
        [{ genericName: "Ibuprofen" }]
      );

      expect(result.prescriptionId).toBe("rx-123");
    });
  });

  describe("Investigation APIs", () => {
    it("should create an investigation", async () => {
      const mockInvestigation = {
        id: "inv-123",
        encounterId: "enc-456",
        investigationType: "LABORATORY",
        name: "Blood Test",
        status: "ORDERED",
      };

      mockClient.post.mockResolvedValue({ data: mockInvestigation });

      const result = await encounterService.createInvestigation({
        encounterId: "enc-456",
        investigationType: "LABORATORY",
        name: "Blood Test",
      });

      expect(result.id).toBe("inv-123");
      expect(result.status).toBe("ORDERED");
    });

    it("should fetch investigations by encounter", async () => {
      const mockInvestigations = [
        {
          id: "inv-1",
          encounterId: "enc-456",
          name: "Blood Test",
          status: "COMPLETED",
        },
        {
          id: "inv-2",
          encounterId: "enc-456",
          name: "X-Ray",
          status: "ORDERED",
        },
      ];

      mockClient.get.mockResolvedValue({ data: mockInvestigations });

      const result =
        await encounterService.getInvestigationsByEncounter("enc-456");

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Blood Test");
    });

    it("should add investigation results", async () => {
      const mockResults = {
        id: "inv-123",
        status: "COMPLETED",
        resultValue: "120",
        resultUnit: "mg/dL",
      };

      mockClient.post.mockResolvedValue({ data: mockResults });

      const result = await encounterService.addInvestigationResults("inv-123", {
        resultValue: "120",
        resultUnit: "mg/dL",
      });

      expect(result.status).toBe("COMPLETED");
      expect(result.resultValue).toBe("120");
    });

    it("should search investigations by LOINC code", async () => {
      const mockResults = [
        {
          id: "inv-1",
          loincCode: "2345-7",
          name: "Glucose",
        },
      ];

      mockClient.get.mockResolvedValue({ data: mockResults });

      const result =
        await encounterService.searchInvestigationByLoinc("2345-7");

      expect(result).toHaveLength(1);
      expect(result[0].loincCode).toBe("2345-7");
    });
  });

  describe("Medication APIs", () => {
    it("should search medications", async () => {
      const mockMedications = [
        {
          id: "med-1",
          genericName: "Aspirin",
          rxNormCode: "7682",
        },
        {
          id: "med-2",
          genericName: "Acetaminophen",
          rxNormCode: "161",
        },
      ];

      mockClient.get.mockResolvedValue({ data: mockMedications });

      const result = await encounterService.searchMedications("aspirin");

      expect(result).toHaveLength(2);
      expect(result[0].genericName).toBe("Aspirin");
    });

    it("should check medication interactions", async () => {
      const mockInteractions = [
        {
          medication: "Aspirin",
          interactions: [],
          recommendation: "No known interactions",
        },
      ];

      mockClient.post.mockResolvedValue({ data: mockInteractions });

      const result = await encounterService.checkMedicationInteractions([
        { genericName: "Aspirin" },
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].medication).toBe("Aspirin");
    });

    it("should get medication contraindications", async () => {
      const mockContraindications = {
        rxNormCode: "7682",
        contraindications: ["Pregnancy", "Bleeding disorders"],
      };

      mockClient.get.mockResolvedValue({ data: mockContraindications });

      const result =
        await encounterService.getMedicationContraindications("7682");

      expect(result.rxNormCode).toBe("7682");
      expect(result.contraindications).toHaveLength(2);
    });

    it("should get medication side effects", async () => {
      const mockSideEffects = {
        rxNormCode: "7682",
        sideEffects: ["Stomach upset", "Dizziness"],
      };

      mockClient.get.mockResolvedValue({ data: mockSideEffects });

      const result = await encounterService.getMedicationSideEffects("7682");

      expect(result.sideEffects).toHaveLength(2);
    });

    it("should get medication dosage info", async () => {
      const mockDosage = {
        rxNormCode: "7682",
        dosageGuidelines: [
          { dose: "500mg", frequency: "BID", duration: "7 days" },
        ],
      };

      mockClient.get.mockResolvedValue({ data: mockDosage });

      const result = await encounterService.getMedicationDosageInfo("7682");

      expect(result.dosageGuidelines).toHaveLength(1);
    });

    it("should check medication allergies", async () => {
      const mockAllergies = {
        patientId: "pat-123",
        medications: ["Aspirin"],
        potentialConflicts: [],
      };

      mockClient.post.mockResolvedValue({ data: mockAllergies });

      const result = await encounterService.checkMedicationAllergies(
        "pat-123",
        ["Aspirin"]
      );

      expect(result.patientId).toBe("pat-123");
      expect(result.potentialConflicts).toHaveLength(0);
    });

    it("should get medication alternatives", async () => {
      const mockAlternatives = {
        rxNormCode: "7682",
        alternatives: [
          { rxNormCode: "161", name: "Acetaminophen" },
          { rxNormCode: "3622", name: "Ibuprofen" },
        ],
      };

      mockClient.get.mockResolvedValue({ data: mockAlternatives });

      const result = await encounterService.getMedicationAlternatives("7682");

      expect(result.alternatives).toHaveLength(2);
    });
  });

  describe("Error Handling", () => {
    it("should handle prescription creation errors", async () => {
      const mockError = new Error("Network error");
      mockClient.post.mockRejectedValue(mockError);

      await expect(
        encounterService.createPrescription({
          encounterId: "enc-456",
          genericName: "Aspirin",
          dosage: "500mg",
          dosageForm: "tablet",
          route: "oral",
          frequency: "BID",
          duration: "7 days",
          quantity: 14,
        })
      ).rejects.toThrow();
    });

    it("should handle investigation fetch errors", async () => {
      const mockError = new Error("Server error");
      mockClient.get.mockRejectedValue(mockError);

      await expect(
        encounterService.getInvestigationsByEncounter("enc-456")
      ).rejects.toThrow();
    });

    it("should handle medication search errors", async () => {
      const mockError = new Error("Search service unavailable");
      mockClient.get.mockRejectedValue(mockError);

      await expect(
        encounterService.searchMedications("aspirin")
      ).rejects.toThrow();
    });
  });
});
