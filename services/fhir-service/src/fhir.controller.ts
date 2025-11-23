import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import {
  FhirResourceInput,
  FhirResourceService,
} from "./fhir-resource.service";

/**
 * Minimal FHIR R4 controller.
 *
 * This is intentionally simple and stateless for now: it validates that
 * the service is reachable and that basic FHIR-like payloads can be
 * exchanged without committing to a specific persistence model yet.
 */
@Controller()
export class FhirController {
  constructor(private readonly fhirService: FhirResourceService) {}
  @Get("health")
  health() {
    return {
      status: "ok",
      service: "fhir-service",
    };
  }

  /**
   * Basic echo-style endpoint for creating FHIR resources.
   * This accepts any resourceType and returns the payload with a
   * synthesized id if one is not present. This will later be
   * replaced by a fully persisted implementation.
   */
  @Post(":resourceType")
  createResource(
    @Param("resourceType") resourceType: string,
    @Body() body: FhirResourceInput
  ) {
    return this.fhirService.createResource(resourceType, body);
  }

  /**
   * Placeholder read endpoint. For now this simply returns a stub response
   * indicating that persistence has not yet been implemented.
   */
  @Get(":resourceType/:id")
  getResourceById(
    @Param("resourceType") resourceType: string,
    @Param("id") id: string
  ) {
    return this.fhirService.getResourceById(resourceType, id);
  }
}
