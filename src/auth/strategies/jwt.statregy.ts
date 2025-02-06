import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { jwtConstants } from '../constants/constants';
import { ActiveToken } from '../entities/active-token.entity';
import { BlacklistedToken } from '../entities/blacklisted-token.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(ActiveToken)
    private readonly activeTokenRepository: Repository<ActiveToken>,
    @InjectRepository(BlacklistedToken)
    private readonly blacklistTokenRepository: Repository<BlacklistedToken>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    // Valida que el token está activo
    if (!token) {
      throw new UnauthorizedException('Token inválido');
    }
    // Validar si el token está en la lista negra
    const blacklistedToken = await this.blacklistTokenRepository.findOne({
      where: { token },
    });

    if (blacklistedToken) {
      throw new UnauthorizedException('Token revocado');
    }
    const activeToken = await this.activeTokenRepository.findOne({
      where: { email: payload.email, token },
    });
    if (!activeToken) {
      throw new UnauthorizedException('Token inválido');
    }
    return {
      sub: payload.sub,
      username: payload.username,
      email: payload.email,
    };
  }
}
