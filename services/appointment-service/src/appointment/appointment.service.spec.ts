import { Test, TestingModule } from "@nestjs/testing";
import { AppointmentStatus, AppointmentType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AppointmentService } from "./appointment.service";

describe("AppointmentService", () => {
  let service: AppointmentService;
  let prisma: PrismaService;

  const mockPrismaService = {
    appointment: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    appointmentChange: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create an appointment with generated appointment number", async () => {
      const createDto = {
        patientId: "patient-123",
        appointmentType: "GENERAL_CHECKUP" as AppointmentType,
        requestedDate: new Date().toISOString(),
        reason: "Annual checkup",
      };

      const mockAppointment = {
        id: "appt-123",
        appointmentNumber: "APT-2024-000001",
        patientId: createDto.patientId,
        appointmentType: createDto.appointmentType,
        status: AppointmentStatus.REQUESTED,
        requestedDate: new Date(createDto.requestedDate),
        reason: createDto.reason,
        duration: 30,
        isTelemedicine: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      };

      mockPrismaService.appointment.count.mockResolvedValue(0);
      mockPrismaService.appointment.create.mockResolvedValue(mockAppointment);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.create(createDto as any, "user-123");

      expect(result).toEqual(mockAppointment);
      expect(mockPrismaService.appointment.count).toHaveBeenCalled();
      expect(mockPrismaService.appointment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            patientId: createDto.patientId,
            appointmentType: createDto.appointmentType,
            appointmentNumber: "APT-2024-000001",
          }),
        })
      );
      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "CREATE_APPOINTMENT",
            resourceId: "appt-123",
          }),
        })
      );
    });

    it("should create appointment with CONFIRMED status if scheduledDate provided", async () => {
      const createDto = {
        patientId: "patient-123",
        appointmentType: "GENERAL_CHECKUP" as AppointmentType,
        scheduledDate: new Date().toISOString(),
      };

      const mockAppointment = {
        id: "appt-456",
        appointmentNumber: "APT-2024-000002",
        status: AppointmentStatus.CONFIRMED,
        ...createDto,
      };

      mockPrismaService.appointment.count.mockResolvedValue(1);
      mockPrismaService.appointment.create.mockResolvedValue(mockAppointment);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.create(createDto as any, "user-123");

      expect(result.status).toBe(AppointmentStatus.CONFIRMED);
    });
  });

  describe("findByPatient", () => {
    it("should return all appointments for a patient", async () => {
      const patientId = "patient-123";
      const mockAppointments = [
        {
          id: "appt-1",
          patientId,
          appointmentType: "GENERAL_CHECKUP",
          status: AppointmentStatus.CONFIRMED,
          changes: [],
          reminders: [],
        },
        {
          id: "appt-2",
          patientId,
          appointmentType: "FOLLOW_UP",
          status: AppointmentStatus.COMPLETED,
          changes: [],
          reminders: [],
        },
      ];

      mockPrismaService.appointment.findMany.mockResolvedValue(
        mockAppointments
      );

      const result = await service.findByPatient(patientId);

      expect(result).toEqual(mockAppointments);
      expect(mockPrismaService.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            patientId,
            isDeleted: false,
          },
          orderBy: {
            scheduledDate: "desc",
          },
        })
      );
    });

    it("should not return deleted appointments", async () => {
      mockPrismaService.appointment.findMany.mockResolvedValue([]);

      await service.findByPatient("patient-123");

      expect(mockPrismaService.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
          }),
        })
      );
    });
  });

  describe("reschedule", () => {
    it("should reschedule an appointment and create change record", async () => {
      const appointmentId = "appt-123";
      const oldDate = new Date("2024-01-15T10:00:00Z");
      const newDate = new Date("2024-01-20T14:00:00Z");

      const mockAppointment = {
        id: appointmentId,
        status: AppointmentStatus.CONFIRMED,
        scheduledDate: oldDate,
        patientId: "patient-123",
      };

      const mockUpdated = {
        ...mockAppointment,
        scheduledDate: newDate,
        status: AppointmentStatus.RESCHEDULED,
      };

      mockPrismaService.appointment.findUnique.mockResolvedValue(
        mockAppointment
      );
      mockPrismaService.appointmentChange.create.mockResolvedValue({});
      mockPrismaService.appointment.update.mockResolvedValue(mockUpdated);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.reschedule(
        appointmentId,
        newDate,
        "Schedule conflict",
        "user-123"
      );

      expect(result.scheduledDate).toEqual(newDate);
      expect(result.status).toBe(AppointmentStatus.RESCHEDULED);
      expect(mockPrismaService.appointmentChange.create).toHaveBeenCalled();
      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "RESCHEDULE_APPOINTMENT",
          }),
        })
      );
    });

    it("should throw error when rescheduling completed appointment", async () => {
      const mockAppointment = {
        id: "appt-123",
        status: AppointmentStatus.COMPLETED,
        scheduledDate: new Date(),
      };

      mockPrismaService.appointment.findUnique.mockResolvedValue(
        mockAppointment
      );

      await expect(
        service.reschedule("appt-123", new Date(), "reason", "user-123")
      ).rejects.toThrow("Cannot reschedule completed or cancelled appointment");
    });
  });

  describe("checkIn", () => {
    it("should check in patient for appointment", async () => {
      const mockAppointment = {
        id: "appt-123",
        status: AppointmentStatus.CONFIRMED,
        patientId: "patient-123",
      };

      const mockCheckedIn = {
        ...mockAppointment,
        status: AppointmentStatus.CHECKED_IN,
        checkInTime: new Date(),
        checkInSymptoms: "Cough, fever",
        checkInTemp: 98.6,
      };

      mockPrismaService.appointment.findUnique.mockResolvedValue(
        mockAppointment
      );
      mockPrismaService.appointment.update.mockResolvedValue(mockCheckedIn);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.checkIn(
        "appt-123",
        "Cough, fever",
        98.6,
        "user-123"
      );

      expect(result.status).toBe(AppointmentStatus.CHECKED_IN);
      expect(result.checkInSymptoms).toBe("Cough, fever");
      expect(result.checkInTemp).toBe(98.6);
    });

    it("should throw error when checking in non-confirmed appointment", async () => {
      const mockAppointment = {
        id: "appt-123",
        status: AppointmentStatus.REQUESTED,
      };

      mockPrismaService.appointment.findUnique.mockResolvedValue(
        mockAppointment
      );

      await expect(
        service.checkIn("appt-123", undefined, undefined, "user-123")
      ).rejects.toThrow("Only confirmed appointments can be checked in");
    });
  });

  describe("cancel", () => {
    it("should cancel an appointment", async () => {
      const mockAppointment = {
        id: "appt-123",
        status: AppointmentStatus.CONFIRMED,
      };

      const mockCancelled = {
        ...mockAppointment,
        status: AppointmentStatus.CANCELLED,
      };

      mockPrismaService.appointment.findUnique.mockResolvedValue(
        mockAppointment
      );
      mockPrismaService.appointment.update.mockResolvedValue(mockCancelled);
      mockPrismaService.auditLog.create.mockResolvedValue({});

      const result = await service.cancel("appt-123", "user-123");

      expect(result.status).toBe(AppointmentStatus.CANCELLED);
      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "CANCEL_APPOINTMENT",
          }),
        })
      );
    });
  });
});
