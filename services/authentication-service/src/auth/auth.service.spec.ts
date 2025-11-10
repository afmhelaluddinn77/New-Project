import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { AuthService } from "./auth.service";
import { LoginDto, PortalType } from "./login.dto";
import { User } from "./user.entity";

describe("AuthService", () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersRepo: Repository<User>;

  // Mock data
  const mockUser = {
    id: "1",
    email: "test@example.com",
    password: "$2b$10$hashedpassword",
    portals: [PortalType.PROVIDER],
    role: "PROVIDER",
  };

  const mockUserEntity = {
    id: "1",
    email: "test@example.com",
    role: "PROVIDER",
    hashedRefreshToken: "$2b$10$hashedRefreshToken",
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUsersRepository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepo = module.get<Repository<User>>(getRepositoryToken(User));

    // Reset mocks
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("login", () => {
    it("should successfully login with valid credentials and portal access", async () => {
      const loginDto: LoginDto = {
        email: "provider@example.com",
        password: "password",
        portalType: PortalType.PROVIDER,
      };

      const mockAccessToken = "mock.access.token";
      const mockRefreshToken = "mock.refresh.token";
      const mockHashedRefreshToken = "hashed.refresh.token";

      mockJwtService.sign
        .mockReturnValueOnce(mockAccessToken) // First call for access token
        .mockReturnValueOnce(mockRefreshToken); // Second call for refresh token

      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve(mockHashedRefreshToken));
      mockUsersRepository.save.mockResolvedValue(mockUserEntity);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        user: {
          id: "2",
          email: "provider@example.com",
          role: "PROVIDER",
          portal: PortalType.PROVIDER,
        },
      });

      // Verify JWT tokens were created
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);

      // Verify access token payload
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          sub: "2",
          role: "PROVIDER",
          portal: PortalType.PROVIDER,
        },
        {
          expiresIn: "15m",
          secret: "your-secret-key-change-in-production",
        }
      );

      // Verify refresh token payload
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          sub: "2",
          role: "PROVIDER",
          portal: PortalType.PROVIDER,
        },
        {
          expiresIn: "7d",
          secret: "refresh-secret-change",
        }
      );

      // Verify refresh token was hashed and saved
      expect(bcrypt.hash).toHaveBeenCalledWith(mockRefreshToken, 10);
      expect(mockUsersRepository.save).toHaveBeenCalledWith({
        id: "2",
        email: "provider@example.com",
        role: "PROVIDER",
        hashedRefreshToken: mockHashedRefreshToken,
      });
    });

    it("should throw UnauthorizedException for non-existent user", async () => {
      const loginDto: LoginDto = {
        email: "nonexistent@example.com",
        password: "password",
        portalType: PortalType.PROVIDER,
      };

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        "Invalid credentials"
      );
    });

    it("should throw UnauthorizedException for unauthorized portal access", async () => {
      const loginDto: LoginDto = {
        email: "provider@example.com",
        password: "password",
        portalType: PortalType.ADMIN, // Provider trying to access Admin portal
      };

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        "User is not authorized to access ADMIN portal"
      );
    });

    it("should handle different portal types correctly", async () => {
      const testCases = [
        {
          email: "patient@example.com",
          portal: PortalType.PATIENT,
          role: "PATIENT",
        },
        { email: "admin@example.com", portal: PortalType.ADMIN, role: "ADMIN" },
        { email: "lab@example.com", portal: PortalType.LAB, role: "LAB" },
        {
          email: "pharmacy@example.com",
          portal: PortalType.PHARMACY,
          role: "PHARMACY",
        },
      ];

      for (const testCase of testCases) {
        mockJwtService.sign
          .mockReturnValueOnce("access.token")
          .mockReturnValueOnce("refresh.token");

        jest.spyOn(bcrypt, "hash").mockResolvedValue("hashed" as never);
        mockUsersRepository.save.mockResolvedValue({});

        const loginDto: LoginDto = {
          email: testCase.email,
          password: "password",
          portalType: testCase.portal,
        };

        const result = await service.login(loginDto);

        expect(result.user.role).toBe(testCase.role);
        expect(result.user.portal).toBe(testCase.portal);
      }
    });
  });

  describe("refreshTokens", () => {
    it("should successfully refresh access token with valid refresh token", async () => {
      const providedToken = "valid.refresh.token";
      const mockPayload = {
        sub: "1",
        role: "PROVIDER",
        portal: PortalType.PROVIDER,
      };
      const newAccessToken = "new.access.token";

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUsersRepository.findOneBy.mockResolvedValue(mockUserEntity);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue(newAccessToken);

      const result = await service.refreshTokens(providedToken);

      expect(result).toEqual({
        accessToken: newAccessToken,
        user: {
          id: "1",
          role: "PROVIDER",
          portal: PortalType.PROVIDER,
        },
      });

      // Verify token was validated
      expect(mockJwtService.verify).toHaveBeenCalledWith(providedToken, {
        secret: "refresh-secret-change",
        ignoreExpiration: false,
      });

      // Verify user was fetched from DB
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({ id: "1" });

      // Verify token hash was compared
      expect(bcrypt.compare).toHaveBeenCalledWith(
        providedToken,
        mockUserEntity.hashedRefreshToken
      );

      // Verify new access token was signed
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: "1", role: "PROVIDER", portal: PortalType.PROVIDER },
        {
          expiresIn: "15m",
          secret: "your-secret-key-change-in-production",
        }
      );
    });

    it("should throw UnauthorizedException for invalid token signature", async () => {
      const invalidToken = "invalid.token";

      mockJwtService.verify.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      await expect(service.refreshTokens(invalidToken)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.refreshTokens(invalidToken)).rejects.toThrow(
        "Invalid refresh token"
      );
    });

    it("should throw UnauthorizedException if user not found in database", async () => {
      const providedToken = "valid.refresh.token";
      const mockPayload = {
        sub: "999",
        role: "PROVIDER",
        portal: PortalType.PROVIDER,
      };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUsersRepository.findOneBy.mockResolvedValue(null);

      await expect(service.refreshTokens(providedToken)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.refreshTokens(providedToken)).rejects.toThrow(
        "No session"
      );
    });

    it("should throw UnauthorizedException if refresh token was revoked (null hash)", async () => {
      const providedToken = "valid.refresh.token";
      const mockPayload = {
        sub: "1",
        role: "PROVIDER",
        portal: PortalType.PROVIDER,
      };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUsersRepository.findOneBy.mockResolvedValue({
        ...mockUserEntity,
        hashedRefreshToken: null, // Token revoked
      });

      await expect(service.refreshTokens(providedToken)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.refreshTokens(providedToken)).rejects.toThrow(
        "No session"
      );
    });

    it("should throw UnauthorizedException if token hash does not match", async () => {
      const providedToken = "valid.refresh.token";
      const mockPayload = {
        sub: "1",
        role: "PROVIDER",
        portal: PortalType.PROVIDER,
      };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUsersRepository.findOneBy.mockResolvedValue(mockUserEntity);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never); // Hash mismatch

      await expect(service.refreshTokens(providedToken)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.refreshTokens(providedToken)).rejects.toThrow(
        "Invalid refresh token"
      );
    });

    it("should handle expired refresh tokens", async () => {
      const expiredToken = "expired.refresh.token";

      mockJwtService.verify.mockImplementation(() => {
        const error: any = new Error("jwt expired");
        error.name = "TokenExpiredError";
        throw error;
      });

      await expect(service.refreshTokens(expiredToken)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe("logout", () => {
    it("should clear refresh token from database on logout", async () => {
      const userId = "1";

      mockUsersRepository.update.mockResolvedValue({ affected: 1 });

      await service.logout(userId);

      expect(mockUsersRepository.update).toHaveBeenCalledWith(
        { id: userId },
        { hashedRefreshToken: null }
      );
    });

    it("should handle logout for non-existent user gracefully", async () => {
      const userId = "999";

      mockUsersRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.logout(userId)).resolves.not.toThrow();

      expect(mockUsersRepository.update).toHaveBeenCalledWith(
        { id: userId },
        { hashedRefreshToken: null }
      );
    });

    it("should allow multiple logouts for the same user", async () => {
      const userId = "1";

      mockUsersRepository.update.mockResolvedValue({ affected: 1 });

      await service.logout(userId);
      await service.logout(userId);

      expect(mockUsersRepository.update).toHaveBeenCalledTimes(2);
    });
  });

  describe("Security edge cases", () => {
    it("should not allow token reuse after logout", async () => {
      const providedToken = "valid.refresh.token";
      const mockPayload = {
        sub: "1",
        role: "PROVIDER",
        portal: PortalType.PROVIDER,
      };

      // Simulate token after logout (hashedRefreshToken is null)
      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUsersRepository.findOneBy.mockResolvedValue({
        ...mockUserEntity,
        hashedRefreshToken: null,
      });

      await expect(service.refreshTokens(providedToken)).rejects.toThrow(
        "No session"
      );
    });

    it("should handle concurrent login sessions (token rotation)", async () => {
      // First login
      const loginDto: LoginDto = {
        email: "provider@example.com",
        password: "password",
        portalType: PortalType.PROVIDER,
      };

      mockJwtService.sign
        .mockReturnValueOnce("access1")
        .mockReturnValueOnce("refresh1");
      jest.spyOn(bcrypt, "hash").mockResolvedValueOnce("hash1" as never);
      mockUsersRepository.save.mockResolvedValue({});

      await service.login(loginDto);

      // Second login (should overwrite refresh token)
      mockJwtService.sign
        .mockReturnValueOnce("access2")
        .mockReturnValueOnce("refresh2");
      jest.spyOn(bcrypt, "hash").mockResolvedValueOnce("hash2" as never);

      await service.login(loginDto);

      // Old token should now be invalid
      const oldToken = "refresh1";
      const mockPayload = {
        sub: "2",
        role: "PROVIDER",
        portal: PortalType.PROVIDER,
      };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockUsersRepository.findOneBy.mockResolvedValue({
        id: "2",
        email: "provider@example.com",
        role: "PROVIDER",
        hashedRefreshToken: "hash2", // New hash
      });
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

      await expect(service.refreshTokens(oldToken)).rejects.toThrow(
        "Invalid refresh token"
      );
    });
  });
});
