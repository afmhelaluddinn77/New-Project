// Root-level Jest config to prevent Jest from parsing e2e-tests and other non-Jest test files
module.exports = {
  // Don't run any tests at root level
  testMatch: [],
  // Explicitly exclude e2e-tests (Playwright tests)
  testPathIgnorePatterns: [
    "/node_modules/",
    "/e2e-tests/",
    "/dist/",
    "/build/",
    "/.git/",
  ],
  // Only look for Jest configs in workspaces / services that define them
  // Frontend portals
  projects: [
    "<rootDir>/provider-portal",

    // Backend services (NestJS, ts-jest)
    "<rootDir>/services/authentication-service",
    "<rootDir>/services/lab-service",
    "<rootDir>/services/encounter-service",
    "<rootDir>/services/pharmacy-service",
    "<rootDir>/services/radiology-service",
    "<rootDir>/services/clinical-workflow-service",

    // These currently have no Jest config/tests; included so they can
    // opt in later without affecting other projects
    "<rootDir>/services/patient-service",
    "<rootDir>/services/aggregation-service",
    "<rootDir>/services/notification-service",
  ],
};
