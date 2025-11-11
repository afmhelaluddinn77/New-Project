/**
 * Health Check Monitoring System
 *
 * Following PROJECT LAW: Always monitor service health
 * Provides real-time system status and alerts
 */

export interface HealthStatus {
  service: string;
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  responseTime: number;
  details?: Record<string, any>;
  error?: string;
}

export interface SystemHealth {
  overall: "healthy" | "degraded" | "unhealthy";
  services: HealthStatus[];
  timestamp: string;
  uptime: number;
}

export class HealthCheckService {
  private services: Map<string, ServiceConfig> = new Map();
  private healthHistory: Map<string, HealthStatus[]> = new Map();
  private alertCallbacks: ((status: SystemHealth) => void)[] = [];
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(private config: HealthCheckConfig = {}) {
    this.config = {
      checkIntervalMs: 30000, // 30 seconds
      historyLimit: 100,
      alertThreshold: 3, // Alert after 3 consecutive failures
      ...config,
    };
  }

  /**
   * Register a service for health monitoring
   */
  registerService(name: string, config: ServiceConfig) {
    this.services.set(name, config);
    this.healthHistory.set(name, []);
    console.log(`📊 Registered health check for ${name}`);
  }

  /**
   * Start continuous health monitoring
   */
  start() {
    if (this.checkInterval) {
      console.warn("Health monitoring already started");
      return;
    }

    console.log("🚀 Starting health monitoring...");

    // Initial check
    this.performHealthChecks();

    // Schedule regular checks
    this.checkInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.config.checkIntervalMs);
  }

  /**
   * Stop health monitoring
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log("⏹️  Health monitoring stopped");
    }
  }

  /**
   * Perform health checks on all registered services
   */
  async performHealthChecks(): Promise<SystemHealth> {
    const startTime = Date.now();
    const serviceStatuses: HealthStatus[] = [];

    for (const [serviceName, serviceConfig] of this.services) {
      try {
        const status = await this.checkService(serviceName, serviceConfig);
        serviceStatuses.push(status);
        this.updateHistory(serviceName, status);
      } catch (error) {
        const errorStatus: HealthStatus = {
          service: serviceName,
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : String(error),
        };
        serviceStatuses.push(errorStatus);
        this.updateHistory(serviceName, errorStatus);
      }
    }

    const systemHealth: SystemHealth = {
      overall: this.calculateOverallHealth(serviceStatuses),
      services: serviceStatuses,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    // Check for alerts
    this.checkAlerts(systemHealth);

    return systemHealth;
  }

  /**
   * Check individual service health
   */
  private async checkService(
    name: string,
    config: ServiceConfig
  ): Promise<HealthStatus> {
    const startTime = Date.now();

    try {
      const response = await fetch(config.url, {
        method: config.method || "GET",
        headers: config.headers || {},
        signal: AbortSignal.timeout(config.timeoutMs || 5000),
      });

      const responseTime = Date.now() - startTime;
      const isHealthy =
        response.ok && responseTime < (config.maxResponseTimeMs || 2000);

      let details: Record<string, any> = {
        statusCode: response.status,
        responseTime,
      };

      // Try to parse response for additional details
      if (config.parseResponse) {
        try {
          const body = await response.text();
          const parsed = JSON.parse(body);
          details = { ...details, ...parsed };
        } catch {
          // Ignore parsing errors
        }
      }

      return {
        service: name,
        status: isHealthy ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        responseTime,
        details,
      };
    } catch (error) {
      return {
        service: name,
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Calculate overall system health
   */
  private calculateOverallHealth(
    services: HealthStatus[]
  ): "healthy" | "degraded" | "unhealthy" {
    const unhealthyCount = services.filter(
      (s) => s.status === "unhealthy"
    ).length;
    const degradedCount = services.filter(
      (s) => s.status === "degraded"
    ).length;

    if (unhealthyCount > 0) {
      return "unhealthy";
    }
    if (degradedCount > 0) {
      return "degraded";
    }
    return "healthy";
  }

  /**
   * Update service health history
   */
  private updateHistory(serviceName: string, status: HealthStatus) {
    const history = this.healthHistory.get(serviceName) || [];
    history.push(status);

    // Limit history size
    if (history.length > this.config.historyLimit!) {
      history.shift();
    }

    this.healthHistory.set(serviceName, history);
  }

  /**
   * Check for alert conditions
   */
  private checkAlerts(systemHealth: SystemHealth) {
    for (const service of systemHealth.services) {
      if (service.status === "unhealthy") {
        const history = this.healthHistory.get(service.service) || [];
        const recentFailures = history
          .slice(-this.config.alertThreshold!)
          .filter((h) => h.status === "unhealthy");

        if (recentFailures.length >= this.config.alertThreshold!) {
          this.triggerAlert(service, systemHealth);
        }
      }
    }
  }

  /**
   * Trigger alert for service failure
   */
  private triggerAlert(service: HealthStatus, systemHealth: SystemHealth) {
    console.error(
      `🚨 ALERT: ${service.service} has been unhealthy for ${this.config.alertThreshold} consecutive checks`
    );

    this.alertCallbacks.forEach((callback) => {
      try {
        callback(systemHealth);
      } catch (error) {
        console.error("Error in alert callback:", error);
      }
    });
  }

  /**
   * Register alert callback
   */
  onAlert(callback: (status: SystemHealth) => void) {
    this.alertCallbacks.push(callback);
  }

  /**
   * Get current system health
   */
  async getCurrentHealth(): Promise<SystemHealth> {
    return this.performHealthChecks();
  }

  /**
   * Get service health history
   */
  getServiceHistory(serviceName: string): HealthStatus[] {
    return this.healthHistory.get(serviceName) || [];
  }

  /**
   * Get health metrics for monitoring dashboard
   */
  getMetrics() {
    const metrics: Record<string, any> = {};

    for (const [serviceName, history] of this.healthHistory) {
      const recentHistory = history.slice(-10); // Last 10 checks
      const healthyCount = recentHistory.filter(
        (h) => h.status === "healthy"
      ).length;
      const avgResponseTime =
        recentHistory.reduce((sum, h) => sum + h.responseTime, 0) /
        recentHistory.length;

      metrics[serviceName] = {
        availability: (healthyCount / recentHistory.length) * 100,
        avgResponseTime: Math.round(avgResponseTime),
        lastCheck: recentHistory[recentHistory.length - 1]?.timestamp,
        status: recentHistory[recentHistory.length - 1]?.status,
      };
    }

    return metrics;
  }
}

export interface ServiceConfig {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  maxResponseTimeMs?: number;
  parseResponse?: boolean;
}

export interface HealthCheckConfig {
  checkIntervalMs?: number;
  historyLimit?: number;
  alertThreshold?: number;
}

/**
 * Default service configurations for the clinical system
 */
export const DEFAULT_SERVICES: Record<string, ServiceConfig> = {
  "authentication-service": {
    url: "http://localhost:3001/health",
    maxResponseTimeMs: 1000,
    parseResponse: true,
  },
  "clinical-workflow-service": {
    url: "http://localhost:3004/health",
    maxResponseTimeMs: 2000,
    parseResponse: true,
  },
  "encounter-service": {
    url: "http://localhost:3005/health",
    maxResponseTimeMs: 2000,
    parseResponse: true,
  },
  "lab-service": {
    url: "http://localhost:3013/health",
    maxResponseTimeMs: 1500,
    parseResponse: true,
  },
  "pharmacy-service": {
    url: "http://localhost:3012/health",
    maxResponseTimeMs: 1500,
    parseResponse: true,
  },
  "radiology-service": {
    url: "http://localhost:3014/health",
    maxResponseTimeMs: 1500,
    parseResponse: true,
  },
  "provider-portal": {
    url: "http://localhost:5174",
    maxResponseTimeMs: 3000,
  },
  "lab-portal": {
    url: "http://localhost:5176",
    maxResponseTimeMs: 3000,
  },
  "pharmacy-portal": {
    url: "http://localhost:5177",
    maxResponseTimeMs: 3000,
  },
  "radiology-portal": {
    url: "http://localhost:5179",
    maxResponseTimeMs: 3000,
  },
  database: {
    url: "http://localhost:5433", // PostgreSQL health check would need custom endpoint
    maxResponseTimeMs: 500,
  },
};
