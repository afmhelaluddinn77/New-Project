import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import type { Request } from 'express'

const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return (req.cookies['refresh_token'] as string) || null
  }
  return null
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: 'refresh-secret-change',
      passReqToCallback: true,
    })
  }

  async validate(req: Request, payload: any) {
    const token = cookieExtractor(req)
    return { ...payload, refreshToken: token }
  }
}
