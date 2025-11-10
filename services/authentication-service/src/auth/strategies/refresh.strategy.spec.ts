import { Test, TestingModule } from "@nestjs/testing";
import { Request } from "express";
import { RefreshTokenStrategy } from "./refresh.strategy";

describe("RefreshTokenStrategy", () => {
  let strategy: RefreshTokenStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefreshTokenStrategy],
    }).compile();

    strategy = module.get<RefreshTokenStrategy>(RefreshTokenStrategy);
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    it("should extract refresh token from cookie and include in payload", async () => {
      const mockRequest = {
        cookies: {
          refresh_token: "valid.refresh.token",
        },
      } as unknown as Request;

      const payload = {
        sub: "1",
        role: "PROVIDER",
        portal: "PROVIDER",
      };

      const result = await strategy.validate(mockRequest, payload);

      expect(result).toEqual({
        ...payload,
        refreshToken: "valid.refresh.token",
      });
    });

    it("should return null refreshToken if cookie not present", async () => {
      const mockRequest = {
        cookies: {},
      } as Request;

      const payload = {
        sub: "1",
        role: "PROVIDER",
        portal: "PROVIDER",
      };

      const result = await strategy.validate(mockRequest, payload);

      expect(result).toEqual({
        ...payload,
        refreshToken: null,
      });
    });

    it("should handle missing cookies object", async () => {
      const mockRequest = {} as Request;

      const payload = {
        sub: "1",
        role: "PROVIDER",
        portal: "PROVIDER",
      };

      const result = await strategy.validate(mockRequest, payload);

      expect(result).toEqual({
        ...payload,
        refreshToken: null,
      });
    });

    it("should preserve all payload claims", async () => {
      const mockRequest = {
        cookies: {
          refresh_token: "token",
        },
      } as unknown as Request;

      const payload = {
        sub: "123",
        role: "ADMIN",
        portal: "ADMIN",
        iat: 1234567890,
        exp: 1234567890,
      };

      const result = await strategy.validate(mockRequest, payload);

      expect(result.sub).toBe("123");
      expect(result.role).toBe("ADMIN");
      expect(result.portal).toBe("ADMIN");
      expect(result.iat).toBe(1234567890);
      expect(result.exp).toBe(1234567890);
      expect(result.refreshToken).toBe("token");
    });
  });
});
