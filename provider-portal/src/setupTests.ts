import "@testing-library/jest-dom";

// Ensure React is in development mode for tests
process.env.NODE_ENV = "test";

// Mock axios globally
jest.mock("axios");

// Suppress console errors during tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Not implemented: HTMLFormElement.prototype.submit") ||
        args[0].includes("Warning: ReactDOM.render"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
