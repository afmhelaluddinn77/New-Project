import { Controller, Post, Body, Res, Req, Get, UseGuards } from '@nestjs/common'
import { Response, Request } from 'express'
import { AuthService } from './auth.service'
import { LoginDto } from './login.dto'
import { AuthGuard } from '@nestjs/passport'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { refreshToken, ...rest } = await this.authService.login(loginDto)
    // set HttpOnly cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    })
    return rest
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(@Req() req: any) {
    const token: string | undefined = req.user?.refreshToken
    if (!token) return { accessToken: null }
    return this.authService.refreshTokens(token)
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const userId: string | undefined = req.user?.sub
    if (userId) {
      await this.authService.logout(userId)
    }
    res.clearCookie('refresh_token', { path: '/api/auth' })
    return { message: 'logged out' }
  }

  @Get('csrf-token')
  getCsrf(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const token = req.csrfToken?.()
    // Expose a readable cookie so the SPA can read and attach it as X-XSRF-TOKEN
    if (token) {
      res.cookie('XSRF-TOKEN', token, {
        httpOnly: false,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      })
    }
    return { csrfToken: token }
  }
}

