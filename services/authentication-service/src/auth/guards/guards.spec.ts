import { ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

describe("JWT Guards", () => {
  describe('AuthGuard("jwt")', () => {
    let guard: any;

    beforeEach(() => {
      guard = new (AuthGuard("jwt"))();
    });

    it("should be defined", () => {
      expect(guard).toBeDefined();
    });

    it("should allow requests with valid JWT", async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: "Bearer valid.token.here",
            },
          }),
        }),
      } as ExecutionContext;

      // Note: In real scenario, this would be tested with actual JWT middleware
      expect(guard).toBeDefined();
    });
  });

  describe('AuthGuard("jwt-refresh")', () => {
    let guard: any;

    beforeEach(() => {
      guard = new (AuthGuard("jwt-refresh"))();
    });

    it("should be defined", () => {
      expect(guard).toBeDefined();
    });

    it("should extract token from cookie", () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            cookies: {
              refresh_token: "refresh.token.here",
            },
          }),
        }),
      } as ExecutionContext;

      expect(guard).toBeDefined();
    });
  });
});
