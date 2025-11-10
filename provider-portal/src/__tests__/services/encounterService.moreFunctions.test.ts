import { encounterService } from '../../services/encounterService';

const mockClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  defaults: { headers: { common: {} as Record<string, string> } },
};

describe('EncounterService - Core endpoints coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.get.mockReset();
    mockClient.post.mockReset();
    mockClient.put.mockReset();
    mockClient.patch.mockReset();
    mockClient.delete.mockReset();
    (encounterService as any)['client'] = mockClient as any;
  });

  it('getPrescription returns data', async () => {
    const data = { id: 'rx-123' };
    mockClient.get.mockResolvedValue({ data });
    const res = await encounterService.getPrescription('rx-123');
    expect(res).toEqual(data);
    expect(mockClient.get).toHaveBeenCalledWith('/prescriptions/rx-123');
  });

  it('updatePrescription returns updated', async () => {
    const data = { id: 'rx-123', status: 'ACTIVE' };
    mockClient.put.mockResolvedValue({ data });
    const res = await encounterService.updatePrescription('rx-123', { status: 'ACTIVE' });
    expect(res).toEqual(data);
    expect(mockClient.put).toHaveBeenCalled();
  });

  it('deletePrescription returns data', async () => {
    const data = { ok: true };
    mockClient.delete.mockResolvedValue({ data });
    const res = await encounterService.deletePrescription('rx-123');
    expect(res).toEqual(data);
  });

  it('getEncounter returns data', async () => {
    const data = { id: 'enc-1' };
    mockClient.get.mockResolvedValue({ data });
    const res = await encounterService.getEncounter('enc-1');
    expect(res).toEqual(data);
  });

  it('createEncounter posts and returns', async () => {
    const data = { id: 'enc-1' };
    mockClient.post.mockResolvedValue({ data });
    const res = await encounterService.createEncounter({
      patientId: 'p', providerId: 'pr', encounterType: 'OUTPATIENT', encounterClass: 'AMBULATORY',
      chiefComplaint: 'c', historyOfPresentIllness: {}, pastMedicalHistory: {}, medicationHistory: {}, familyHistory: {},
      socialHistory: {}, reviewOfSystems: {}, vitalSigns: {}, generalExamination: {}, cardiovascularExam: {}, respiratoryExam: {},
      abdominalExam: {}, neurologicalExam: {}, musculoskeletalExam: {}, investigations: {}, medications: {}, createdBy: 'u'
    } as any);
    expect(res).toEqual(data);
  });

  it('updateEncounter patches and returns', async () => {
    const data = { id: 'enc-1', chiefComplaint: 'new' };
    mockClient.patch.mockResolvedValue({ data });
    const res = await encounterService.updateEncounter('enc-1', { chiefComplaint: 'new' });
    expect(res).toEqual(data);
  });

  it('getPatientEncounters returns list', async () => {
    const data = [{ id: 'enc-1' }];
    mockClient.get.mockResolvedValue({ data });
    const res = await encounterService.getPatientEncounters('patient-1');
    expect(res).toEqual(data);
  });

  it('finalizeEncounter posts and returns', async () => {
    const data = { id: 'enc-1', status: 'FINALIZED' };
    mockClient.post.mockResolvedValue({ data });
    const res = await encounterService.finalizeEncounter('enc-1');
    expect(res).toEqual(data);
  });

  it('deleteEncounter deletes and returns', async () => {
    const data = { ok: true };
    mockClient.delete.mockResolvedValue({ data });
    const res = await encounterService.deleteEncounter('enc-1');
    expect(res).toEqual(data);
  });
});
