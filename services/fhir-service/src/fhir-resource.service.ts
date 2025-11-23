import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";

export interface FhirResourceInput {
  resourceType: string;
  id?: string;
  // Allow arbitrary additional properties from FHIR payloads
  [key: string]: unknown;
}

@Injectable()
export class FhirResourceService {
  constructor(private readonly prisma: PrismaService) {}

  async createResource(resourceType: string, resource: FhirResourceInput) {
    const resourceId =
      typeof resource.id === "string" && resource.id.length > 0
        ? resource.id
        : `temp-${Date.now()}`;

    const body = {
      ...resource,
      resourceType,
      id: resourceId,
    };

    const record = await this.prisma.fhirResource.upsert({
      where: {
        resourceType_resourceId: { resourceType, resourceId },
      },
      update: {
        body,
      },
      create: {
        resourceType,
        resourceId,
        body,
      },
    });

    return record.body as Record<string, unknown>;
  }

  async getResourceById(resourceType: string, resourceId: string) {
    const record = await this.prisma.fhirResource.findUnique({
      where: {
        resourceType_resourceId: { resourceType, resourceId },
      },
    });

    if (!record) {
      throw new NotFoundException(
        `FHIR ${resourceType}/${resourceId} not found`
      );
    }

    return record.body as Record<string, unknown>;
  }
}
