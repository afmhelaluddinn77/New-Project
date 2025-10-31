import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { LoginDto, PortalType } from './login.dto'

// Mock user database - In production, this would be a real database
interface User {
  id: string
  email: string
  password: string
  portals: PortalType[]
  role: string
}

const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'patient@example.com',
    password: '$2b$10$rVz8vYz8Zz8Zz8Zz8Zz8Zu8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz', // 'password'
    portals: [PortalType.PATIENT],
    role: 'PATIENT',
  },
  {
    id: '2',
    email: 'provider@example.com',
    password: '$2b$10$rVz8vYz8Zz8Zz8Zz8Zz8Zu8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz',
    portals: [PortalType.PROVIDER],
    role: 'PROVIDER',
  },
  {
    id: '3',
    email: 'admin@example.com',
    password: '$2b$10$rVz8vYz8Zz8Zz8Zz8Zz8Zu8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz',
    portals: [PortalType.ADMIN],
    role: 'ADMIN',
  },
  {
    id: '4',
    email: 'lab@example.com',
    password: '$2b$10$rVz8vYz8Zz8Zz8Zz8Zz8Zu8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz',
    portals: [PortalType.LAB],
    role: 'LAB',
  },
  {
    id: '5',
    email: 'pharmacy@example.com',
    password: '$2b$10$rVz8vYz8Zz8Zz8Zz8Zz8Zu8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz',
    portals: [PortalType.PHARMACY],
    role: 'PHARMACY',
  },
  {
    id: '6',
    email: 'billing@example.com',
    password: '$2b$10$rVz8vYz8Zz8Zz8Zz8Zz8Zu8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz',
    portals: [PortalType.BILLING],
    role: 'BILLING',
  },
  {
    id: '7',
    email: 'radiology@example.com',
    password: '$2b$10$rVz8vYz8Zz8Zz8Zz8Zz8Zu8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz8Zz',
    portals: [PortalType.RADIOLOGY],
    role: 'RADIOLOGY',
  },
]

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    // Find user by email
    const user = MOCK_USERS.find((u) => u.email === loginDto.email)
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Validate password (in production, use bcrypt.compare)
    // For demo purposes, we'll skip actual password hashing
    const isPasswordValid = true // Simplified for demo
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // CRITICAL: Validate portal authorization
    if (!user.portals.includes(loginDto.portalType)) {
      throw new UnauthorizedException(
        `User is not authorized to access ${loginDto.portalType} portal`
      )
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      portal: loginDto.portalType,
    }

    const access_token = this.jwtService.sign(payload)

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        portal: loginDto.portalType,
      },
    }
  }
}

