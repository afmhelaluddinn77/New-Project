import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import * as cookieParser from 'cookie-parser'
import * as csurf from 'csurf'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../src/auth/auth.module'
import { User } from '../src/auth/user.entity'

describe('Auth E2E', () => {
  let app: INestApplication
  let agent: any

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
          synchronize: true,
        }),
        AuthModule,
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    // Mirror production middleware
    app.use(cookieParser())
    app.use(
      // @ts-ignore types mismatch for csurf init
      csurf({
        cookie: {
          httpOnly: true,
          sameSite: 'strict',
          secure: false,
        },
      }),
    )
    app.setGlobalPrefix('api')
    await app.init()
    agent = request.agent(app.getHttpServer())
  })

  afterAll(async () => {
    await app.close()
  })

  const getCsrf = async () => {
    const res = await agent.get('/api/auth/csrf-token').expect(200)
    expect(res.body.csrfToken).toBeDefined()
    return res.body.csrfToken as string
  }

  it('should get csrf-token and set cookies', async () => {
    const res = await agent.get('/api/auth/csrf-token').expect(200)
    expect(res.headers['set-cookie']).toBeDefined()
    expect(res.body.csrfToken).toBeDefined()
  })

  it('should login and set refresh cookie', async () => {
    const xsrf = await getCsrf()
    const res = await agent
      .post('/api/auth/login')
      .set('X-XSRF-TOKEN', xsrf)
      .send({ email: 'provider@example.com', password: 'password', portalType: 'PROVIDER' })
      .expect(201)

    expect(res.body.accessToken).toBeDefined()
    expect(res.body.user).toBeDefined()
    const setCookie = (res.headers['set-cookie'] as string[] | undefined) ?? []
    expect(setCookie.join(';')).toContain('refresh_token=')
  })

  it('should refresh with valid cookie', async () => {
    const xsrf = await getCsrf()
    const res = await agent.post('/api/auth/refresh').set('X-XSRF-TOKEN', xsrf).expect(201)
    expect(res.body.accessToken).toBeDefined()
    expect(res.body.user).toBeDefined()
  })

  it('should logout and invalidate refresh', async () => {
    const xsrf = await getCsrf()
    await agent.post('/api/auth/logout').set('X-XSRF-TOKEN', xsrf).expect(201)

    const xsrf2 = await getCsrf()
    await agent.post('/api/auth/refresh').set('X-XSRF-TOKEN', xsrf2).expect(401)
  })
})
