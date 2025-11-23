import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AppointmentService } from "./appointment.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";

@ApiTags("appointments")
@Controller("appointments")
@UseGuards(JwtAuthGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  /**
   * Create a new appointment (Feature #3)
   */
  @Post()
  @ApiOperation({ summary: "Create new appointment" })
  @ApiResponse({ status: 201, description: "Appointment created successfully" })
  @ApiResponse({ status: 400, description: "Invalid appointment data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  create(@Body() createDto: CreateAppointmentDto, @Request() req: any) {
    return this.appointmentService.create(createDto, req.user.id);
  }

  /**
   * Get all appointments for a patient (Feature #2)
   */
  @Get("patient/:patientId")
  @ApiOperation({ summary: "Get appointments for a patient" })
  @ApiResponse({ status: 200, description: "List of appointments" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findByPatient(@Param("patientId") patientId: string) {
    return this.appointmentService.findByPatient(patientId);
  }

  /**
   * Get all appointments for a provider
   */
  @Get("provider/:providerId")
  @ApiOperation({ summary: "Get appointments for a provider" })
  @ApiResponse({ status: 200, description: "List of appointments" })
  findByProvider(
    @Param("providerId") providerId: string,
    @Query("date") date?: string
  ) {
    const queryDate = date ? new Date(date) : undefined;
    return this.appointmentService.findByProvider(providerId, queryDate);
  }

  /**
   * Get a single appointment by ID
   */
  @Get(":id")
  @ApiOperation({ summary: "Get appointment by ID" })
  @ApiResponse({ status: 200, description: "Appointment details" })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  findOne(@Param("id") id: string) {
    return this.appointmentService.findOne(id);
  }

  /**
   * Reschedule an appointment (Feature #4)
   */
  @Patch(":id/reschedule")
  @ApiOperation({ summary: "Reschedule an appointment" })
  @ApiResponse({ status: 200, description: "Appointment rescheduled" })
  @ApiResponse({ status: 400, description: "Cannot reschedule appointment" })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  reschedule(
    @Param("id") id: string,
    @Body() body: { newDate: string; reason: string },
    @Request() req: any
  ) {
    return this.appointmentService.reschedule(
      id,
      new Date(body.newDate),
      body.reason,
      req.user.id
    );
  }

  /**
   * Cancel an appointment
   */
  @Patch(":id/cancel")
  @ApiOperation({ summary: "Cancel an appointment" })
  @ApiResponse({ status: 200, description: "Appointment cancelled" })
  @ApiResponse({ status: 400, description: "Cannot cancel appointment" })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  cancel(@Param("id") id: string, @Request() req: any) {
    return this.appointmentService.cancel(id, req.user.id);
  }

  /**
   * Check-in for an appointment (Feature #20)
   */
  @Patch(":id/check-in")
  @ApiOperation({ summary: "Check-in for an appointment" })
  @ApiResponse({ status: 200, description: "Checked in successfully" })
  @ApiResponse({
    status: 400,
    description: "Cannot check-in for this appointment",
  })
  @ApiResponse({ status: 404, description: "Appointment not found" })
  checkIn(
    @Param("id") id: string,
    @Body() body: { symptoms?: string; temperature?: number },
    @Request() req: any
  ) {
    return this.appointmentService.checkIn(
      id,
      body.symptoms,
      body.temperature,
      req.user.id
    );
  }
}
