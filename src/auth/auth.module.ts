import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants/constants';
import { ActiveToken } from './entities/active-token.entity';
import { BlacklistedToken } from './entities/blacklisted-token.entity';
import { Log } from './entities/log.entity';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([ActiveToken, BlacklistedToken, Log]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
