/**
 * Base Domain Event Interface
 *
 * Follows Development Law:
 * - FHIR R4 compatible event structure
 * - HIPAA audit trail (userId, timestamp, portalType)
 * - Event sourcing pattern for microservices
 */

export interface DomainEvent {
  /**
   * Unique event identifier (UUID v4)
   */
  eventId: string;

  /**
   * Event type in dot notation (e.g., 'patient.created', 'lab.result.available')
   */
  eventType: string;

  /**
   * Aggregate ID (resource ID this event relates to)
   */
  aggregateId: string;

  /**
   * Aggregate type (FHIR resource type: Patient, Observation, etc.)
   */
  aggregateType: string;

  /**
   * Event timestamp (ISO 8601)
   */
  timestamp: Date;

  /**
   * User who triggered the event (for HIPAA audit)
   */
  userId: string;

  /**
   * Portal where event originated (for HIPAA audit)
   */
  portalType:
    | "PROVIDER"
    | "PATIENT"
    | "ADMIN"
    | "LAB"
    | "PHARMACY"
    | "BILLING"
    | "RADIOLOGY";

  /**
   * Event-specific payload
   */
  data: Record<string, any>;

  /**
   * Optional correlation ID for tracing across services
   */
  correlationId?: string;

  /**
   * Event version for schema evolution
   */
  version?: string;
}

/**
 * Event metadata for processing
 */
export interface EventMetadata {
  /**
   * Number of retry attempts
   */
  retryCount?: number;

  /**
   * Service that published the event
   */
  publishedBy?: string;

  /**
   * Services that should consume this event
   */
  intendedConsumers?: string[];
}
