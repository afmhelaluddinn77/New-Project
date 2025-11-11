/**
 * Comprehensive Error Handling System
 *
 * Following PROJECT LAW: Always provide user-friendly error messages
 * Prevents cryptic errors and improves user experience
 */

export enum ErrorCode {
  // Authentication Errors
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
  CSRF_TOKEN_INVALID = "CSRF_TOKEN_INVALID",

  // Validation Errors
  VALIDATION_FAILED = "VALIDATION_FAILED",
  REQUIRED_FIELD_MISSING = "REQUIRED_FIELD_MISSING",
  INVALID_FORMAT = "INVALID_FORMAT",

  // Business Logic Errors
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",

  // Service Errors
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",

  // System Errors
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  userMessage: string;
  statusCode: number;
  context?: Record<string, any>;
  suggestions?: string[];
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly userMessage: string;
  public readonly statusCode: number;
  public readonly context?: Record<string, any>;
  public readonly suggestions?: string[];

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = "AppError";
    this.code = details.code;
    this.userMessage = details.userMessage;
    this.statusCode = details.statusCode;
    this.context = details.context;
    this.suggestions = details.suggestions;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, AppError);
  }
}

/**
 * Error message templates for consistent user communication
 */
export const ERROR_MESSAGES: Record<
  ErrorCode,
  Omit<ErrorDetails, "context">
> = {
  [ErrorCode.INVALID_CREDENTIALS]: {
    code: ErrorCode.INVALID_CREDENTIALS,
    message: "Authentication failed: Invalid email or password",
    userMessage:
      "Invalid email or password. Please check your credentials and try again.",
    statusCode: 401,
    suggestions: [
      "Verify your email address is correct",
      "Check if Caps Lock is enabled",
      'Use the "Forgot Password" link if needed',
    ],
  },

  [ErrorCode.TOKEN_EXPIRED]: {
    code: ErrorCode.TOKEN_EXPIRED,
    message: "JWT token has expired",
    userMessage: "Your session has expired. Please log in again.",
    statusCode: 401,
    suggestions: ['Click "Sign In" to log in again'],
  },

  [ErrorCode.UNAUTHORIZED_ACCESS]: {
    code: ErrorCode.UNAUTHORIZED_ACCESS,
    message: "User does not have required permissions",
    userMessage: "You don't have permission to access this resource.",
    statusCode: 403,
    suggestions: [
      "Contact your administrator for access",
      "Verify you're logged into the correct portal",
    ],
  },

  [ErrorCode.CSRF_TOKEN_INVALID]: {
    code: ErrorCode.CSRF_TOKEN_INVALID,
    message: "CSRF token validation failed",
    userMessage:
      "Security token expired. Please refresh the page and try again.",
    statusCode: 403,
    suggestions: [
      "Refresh the page (F5)",
      "Clear browser cache if the problem persists",
    ],
  },

  [ErrorCode.VALIDATION_FAILED]: {
    code: ErrorCode.VALIDATION_FAILED,
    message: "Request validation failed",
    userMessage: "Please check the form data and correct any errors.",
    statusCode: 400,
    suggestions: [
      "Review highlighted fields",
      "Ensure all required fields are filled",
    ],
  },

  [ErrorCode.REQUIRED_FIELD_MISSING]: {
    code: ErrorCode.REQUIRED_FIELD_MISSING,
    message: "Required field is missing",
    userMessage: "Please fill in all required fields.",
    statusCode: 400,
    suggestions: [
      "Look for fields marked with *",
      "Complete all highlighted sections",
    ],
  },

  [ErrorCode.INVALID_FORMAT]: {
    code: ErrorCode.INVALID_FORMAT,
    message: "Field format is invalid",
    userMessage: "Please check the format of the entered data.",
    statusCode: 400,
    suggestions: [
      "Follow the format examples provided",
      "Remove any special characters if not allowed",
    ],
  },

  [ErrorCode.RESOURCE_NOT_FOUND]: {
    code: ErrorCode.RESOURCE_NOT_FOUND,
    message: "Requested resource not found",
    userMessage: "The requested item could not be found.",
    statusCode: 404,
    suggestions: [
      "Check if the item was deleted",
      "Verify the URL is correct",
      "Try refreshing the page",
    ],
  },

  [ErrorCode.DUPLICATE_RESOURCE]: {
    code: ErrorCode.DUPLICATE_RESOURCE,
    message: "Resource already exists",
    userMessage:
      "This item already exists. Please use a different name or identifier.",
    statusCode: 409,
    suggestions: ["Choose a unique name", "Check existing items first"],
  },

  [ErrorCode.INSUFFICIENT_PERMISSIONS]: {
    code: ErrorCode.INSUFFICIENT_PERMISSIONS,
    message: "User lacks required role or permissions",
    userMessage: "You don't have the necessary permissions for this action.",
    statusCode: 403,
    suggestions: ["Contact your supervisor", "Request additional permissions"],
  },

  [ErrorCode.OPERATION_NOT_ALLOWED]: {
    code: ErrorCode.OPERATION_NOT_ALLOWED,
    message: "Operation not allowed in current state",
    userMessage: "This action is not allowed at this time.",
    statusCode: 400,
    suggestions: [
      "Check the current status",
      "Complete prerequisite steps first",
    ],
  },

  [ErrorCode.DATABASE_ERROR]: {
    code: ErrorCode.DATABASE_ERROR,
    message: "Database operation failed",
    userMessage: "A database error occurred. Please try again later.",
    statusCode: 500,
    suggestions: [
      "Try again in a few moments",
      "Contact support if the problem persists",
    ],
  },

  [ErrorCode.EXTERNAL_SERVICE_ERROR]: {
    code: ErrorCode.EXTERNAL_SERVICE_ERROR,
    message: "External service call failed",
    userMessage:
      "An external service is temporarily unavailable. Please try again.",
    statusCode: 502,
    suggestions: ["Wait a moment and try again", "Check system status page"],
  },

  [ErrorCode.NETWORK_ERROR]: {
    code: ErrorCode.NETWORK_ERROR,
    message: "Network request failed",
    userMessage:
      "Network connection error. Please check your internet connection.",
    statusCode: 0,
    suggestions: ["Check your internet connection", "Try refreshing the page"],
  },

  [ErrorCode.TIMEOUT_ERROR]: {
    code: ErrorCode.TIMEOUT_ERROR,
    message: "Request timed out",
    userMessage: "The request took too long to complete. Please try again.",
    statusCode: 408,
    suggestions: [
      "Try again with a smaller request",
      "Check your internet speed",
    ],
  },

  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: "Internal server error",
    userMessage: "An unexpected error occurred. Our team has been notified.",
    statusCode: 500,
    suggestions: ["Try again later", "Contact support if urgent"],
  },

  [ErrorCode.SERVICE_UNAVAILABLE]: {
    code: ErrorCode.SERVICE_UNAVAILABLE,
    message: "Service is temporarily unavailable",
    userMessage:
      "This service is temporarily unavailable. Please try again later.",
    statusCode: 503,
    suggestions: [
      "Check back in a few minutes",
      "Visit our status page for updates",
    ],
  },

  [ErrorCode.RATE_LIMIT_EXCEEDED]: {
    code: ErrorCode.RATE_LIMIT_EXCEEDED,
    message: "Rate limit exceeded",
    userMessage: "Too many requests. Please wait a moment before trying again.",
    statusCode: 429,
    suggestions: [
      "Wait 15 minutes before trying again",
      "Reduce the frequency of requests",
    ],
  },
};

/**
 * Creates a standardized AppError from an ErrorCode
 */
export function createError(
  code: ErrorCode,
  context?: Record<string, any>
): AppError {
  const template = ERROR_MESSAGES[code];
  return new AppError({
    ...template,
    context,
  });
}

/**
 * Converts unknown errors to standardized AppError
 */
export function normalizeError(
  error: unknown,
  fallbackCode = ErrorCode.INTERNAL_SERVER_ERROR
): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Try to map common error patterns
    if (error.message.includes("ECONNREFUSED")) {
      return createError(ErrorCode.EXTERNAL_SERVICE_ERROR, {
        originalError: error.message,
      });
    }

    if (error.message.includes("timeout")) {
      return createError(ErrorCode.TIMEOUT_ERROR, {
        originalError: error.message,
      });
    }

    if (error.message.includes("validation")) {
      return createError(ErrorCode.VALIDATION_FAILED, {
        originalError: error.message,
      });
    }

    // Generic error mapping
    return createError(fallbackCode, {
      originalError: error.message,
      stack: error.stack,
    });
  }

  // Unknown error type
  return createError(fallbackCode, { originalError: String(error) });
}

/**
 * Error response formatter for APIs
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    suggestions?: string[];
    context?: Record<string, any>;
  };
  timestamp: string;
  requestId?: string;
}

export function formatErrorResponse(
  error: AppError,
  requestId?: string
): ErrorResponse {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.userMessage,
      suggestions: error.suggestions,
      context: error.context,
    },
    timestamp: new Date().toISOString(),
    requestId,
  };
}

/**
 * Logs errors with appropriate level and context
 */
export function logError(
  error: AppError,
  logger: any,
  additionalContext?: Record<string, any>
) {
  const logContext = {
    code: error.code,
    statusCode: error.statusCode,
    context: error.context,
    stack: error.stack,
    ...additionalContext,
  };

  if (error.statusCode >= 500) {
    logger.error(error.message, logContext);
  } else if (error.statusCode >= 400) {
    logger.warn(error.message, logContext);
  } else {
    logger.info(error.message, logContext);
  }
}
