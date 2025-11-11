import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto, PortalType } from "./login.dto";

// NOTE: We keep MOCK_USERS for demo auth identity, but persist refresh tokens in DB

// Mock user database - In production, this would be a real database
interface User {
  id: string;
  email: string;
  password: string;
  portals: PortalType[];
  role: string;
}

const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "patient@example.com",
    password: "$2b$10$rVz8vYz8Zz8Zz8Zz8Zz8Zu8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz", // 'password'
    portals: [PortalType.PATIENT],
    role: "PATIENT",
  },
  {
    id: "2",
    email: "provider@example.com",
    password: "$2b$10$rVz8vYz8Zz8Zz8Zz8Zz8Zu8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz",
    portals: [PortalType.PROVIDER],
    role: "PROVIDER",
  },
  {
    id: "3",
    email: "admin@example.com",
    password: "$2b$10$rVz8vYz8Zz8Zz8Zz8Zz8Zu8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz",
    portals: [PortalType.ADMIN],
    role: "ADMIN",
  },
  {
    id: "4",
    email: "lab@example.com",
    password: "$2b$10$rVz8vYz8Zz8Zz8Zz8Zz8Zu8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz",
    portals: [PortalType.LAB],
    role: "LAB",
  },
  {
    id: "5",
    email: "pharmacy@example.com",
    password: "$2b$10$rVz8vYz8Zz8Zz8Zz8Zz8Zu8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz",
    portals: [PortalType.PHARMACY],
    role: "PHARMACY",
  },
  {
    id: "6",
    email: "billing@example.com",
    password: "$2b$10$rVz8vYz8Zz8Zz8Zz8Zz8Zu8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz",
    portals: [PortalType.BILLING],
    role: "BILLING",
  },
  {
    id: "7",
    email: "radiology@example.com",
    password: "$2b$10$rVz8vYz8Zz8Zz8Zz8Zz8Zu8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz",
    portals: [PortalType.RADIOLOGY],
    role: "RADIOLOGY",
  },
];

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async login(loginDto: LoginDto) {
    // Find user by email in database
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Validate password using bcrypt
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // CRITICAL: Validate portal authorization
    const userPortalType = user.portal?.toUpperCase();
    const requestedPortalType = loginDto.portalType.toUpperCase();
    
    if (userPortalType !== requestedPortalType) {
      throw new UnauthorizedException(
        `User is not authorized to access ${loginDto.portalType} portal`
      );
    }

    // Payload common to both tokens
    const payload = {
      sub: user.id,
      role: user.role,
      portal: loginDto.portalType,
    };

    // 1. Access token (15 min)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: "15m",
      secret: "your-secret-key-change-in-production",
    });

    // 2. Refresh token (7 days)
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: "7d",
      secret: "refresh-secret-change",
    });

    // store/update hashed refresh token in DB
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        hashedRefreshToken: hashed,
        lastLoginAt: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken, // controller will set cookie and strip from body later if desired
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        portal: loginDto.portalType,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async refreshTokens(providedToken: string) {
    // 1) Verify signature and decode payload
    let payload: any;
    try {
      payload = this.jwtService.verify(providedToken, {
        secret: "refresh-secret-change",
        ignoreExpiration: false,
      });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
    const userId: string = payload.sub;
    const dbUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || !dbUser.hashedRefreshToken)
      throw new UnauthorizedException("No session");

    // 2) Ensure provided token matches stored hash (revocation protection)
    const valid = await bcrypt.compare(
      providedToken,
      dbUser.hashedRefreshToken
    );
    if (!valid) throw new UnauthorizedException("Invalid refresh token");

    // 3) Issue a new access token (include role/portal from payload)
    const newAccess = this.jwtService.sign(
      { sub: userId, role: payload.role, portal: payload.portal },
      {
        expiresIn: "15m",
        secret: "your-secret-key-change-in-production",
      }
    );

    return {
      accessToken: newAccess,
      user: { id: userId, role: payload.role, portal: payload.portal },
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: null },
    });
  }
}
