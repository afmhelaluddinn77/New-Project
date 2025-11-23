import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AppointmentStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";

@Injectable()
export class AppointmentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new appointment request (Feature #3: Schedule New Appointments)
   * @param createDto - Appointment data
   * @param userId - ID of user creating the appointment
   * @returns Created appointment
   */
  async create(createDto: CreateAppointmentDto, userId: string) {
    // Generate appointment number
    const count = await this.prisma.appointment.count();
    const appointmentNumber = `APT-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;

    // Create appointment
    const appointment = await this.prisma.appointment.create({
      data: {
        appointmentNumber,
        patientId: createDto.patientId,
        providerId: createDto.providerId,
        appointmentType: createDto.appointmentType,
        status: createDto.scheduledDate
          ? AppointmentStatus.CONFIRMED
          : AppointmentStatus.REQUESTED,
        requestedDate: createDto.requestedDate
          ? new Date(createDto.requestedDate)
          : undefined,
        requestedTime: createDto.requestedTime,
        scheduledDate: createDto.scheduledDate
          ? new Date(createDto.scheduledDate)
          : undefined,
        duration: createDto.duration || 30,
        location: createDto.location,
        isTelemedicine: createDto.isTelemedicine || false,
        reason: createDto.reason,
        notes: createDto.notes,
        instructions: createDto.instructions,
        createdBy: userId,
      },
    });

    // Log audit event
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: "CREATE_APPOINTMENT",
        resourceType: "Appointment",
        resourceId: appointment.id,
        success: true,
      },
    });

    return appointment;
  }

  /**
   * Get appointments for a patient (Feature #2: View Appointments)
   * @param patientId - Patient ID
   * @returns List of appointments
   */
  async findByPatient(patientId: string) {
    return this.prisma.appointment.findMany({
      where: {
        patientId,
        isDeleted: false,
      },
      orderBy: {
        scheduledDate: "desc",
      },
      include: {
        changes: true,
        reminders: true,
      },
    });
  }

  /**
   * Get a single appointment by ID
   * @param id - Appointment ID
   * @returns Appointment details
   */
  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        changes: true,
        reminders: true,
      },
    });

    if (!appointment || appointment.isDeleted) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  /**
   * Reschedule an appointment (Feature #4: Reschedule Appointments)
   * @param id - Appointment ID
   * @param newDate - New appointment date
   * @param reason - Reason for rescheduling
   * @param userId - User requesting the change
   * @returns Updated appointment
   */
  async reschedule(id: string, newDate: Date, reason: string, userId: string) {
    const appointment = await this.findOne(id);

    if (
      appointment.status === AppointmentStatus.COMPLETED ||
      appointment.status === AppointmentStatus.CANCELLED
    ) {
      throw new BadRequestException(
        "Cannot reschedule completed or cancelled appointment"
      );
    }

    // Record the change request
    await this.prisma.appointmentChange.create({
      data: {
        appointmentId: id,
        oldDate: appointment.scheduledDate,
        newDate,
        reason,
        requestedBy: userId,
        status: "REQUESTED",
      },
    });

    // Update appointment
    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        scheduledDate: newDate,
        status: AppointmentStatus.RESCHEDULED,
        updatedBy: userId,
      },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: "RESCHEDULE_APPOINTMENT",
        resourceType: "Appointment",
        resourceId: id,
        success: true,
        metadata: { oldDate: appointment.scheduledDate, newDate, reason },
      },
    });

    return updated;
  }

  /**
   * Cancel an appointment
   * @param id - Appointment ID
   * @param userId - User cancelling the appointment
   * @returns Updated appointment
   */
  async cancel(id: string, userId: string) {
    const appointment = await this.findOne(id);

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException("Cannot cancel completed appointment");
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        updatedBy: userId,
      },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: "CANCEL_APPOINTMENT",
        resourceType: "Appointment",
        resourceId: id,
        success: true,
      },
    });

    return updated;
  }

  /**
   * Check-in for an appointment (Feature #20: Self-Check-in)
   * @param id - Appointment ID
   * @param symptoms - Patient symptoms at check-in
   * @param temperature - Patient temperature at check-in
   * @param userId - User checking in
   * @returns Updated appointment
   */
  async checkIn(
    id: string,
    symptoms?: string,
    temperature?: number,
    userId?: string
  ) {
    const appointment = await this.findOne(id);

    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new BadRequestException(
        "Only confirmed appointments can be checked in"
      );
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CHECKED_IN,
        checkInTime: new Date(),
        checkInSymptoms: symptoms,
        checkInTemp: temperature,
        updatedBy: userId,
      },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: "CHECK_IN_APPOINTMENT",
        resourceType: "Appointment",
        resourceId: id,
        success: true,
      },
    });

    return updated;
  }

  /**
   * Get appointments for a provider
   * @param providerId - Provider ID
   * @param date - Optional date filter
   * @returns List of appointments
   */
  async findByProvider(providerId: string, date?: Date) {
    const where: any = {
      providerId,
      isDeleted: false,
    };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.scheduledDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.appointment.findMany({
      where,
      orderBy: {
        scheduledDate: "asc",
      },
    });
  }
}
