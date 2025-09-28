import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
  ],
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 1000,
      limit: 10
    }]),
    JwtModule.register({}),
    forwardRef(() => UsersModule),
  ],
  exports: [
    JwtModule,
    AuthService
  ]
})
export class AuthModule { }
