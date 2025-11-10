import { Test, TestingModule } from "@nestjs/testing";
import { JwtStrategy } from "./jwt.strategy";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    it("should return user payload for valid token", async () => {
      const payload = {
        sub: "1",
        role: "PROVIDER",
        portal: "PROVIDER",
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        sub: "1",
        role: "PROVIDER",
        portal: "PROVIDER",
      });
    });

    it("should handle different roles", async () => {
      const roles = ["PATIENT", "PROVIDER", "ADMIN", "LAB", "PHARMACY"];

      for (const role of roles) {
        const payload = {
          sub: "1",
          role: role,
          portal: role,
        };

        const result = await strategy.validate(payload);

        expect(result.role).toBe(role);
        expect(result.portal).toBe(role);
      }
    });

    it("should extract user ID from sub claim", async () => {
      const payload = {
        sub: "12345",
        role: "PROVIDER",
        portal: "PROVIDER",
      };

      const result = await strategy.validate(payload);

      expect(result.sub).toBe("12345");
    });
  });
});
