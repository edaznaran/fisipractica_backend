import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { Repository } from 'typeorm';
import { LogInDto } from './dto/log-in.dto';
import { LogOutDto } from './dto/log-out.dto';
import { ActiveToken } from './entities/active-token.entity';
import { BlacklistedToken } from './entities/blacklisted-token.entity';
import { Log } from './entities/log.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(ActiveToken)
    private activeTokenRepository: Repository<ActiveToken>,
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
    @InjectRepository(BlacklistedToken)
    private blacklistTokenRepository: Repository<BlacklistedToken>,
  ) {}

  async logIn(logInDto: LogInDto): Promise<any> {
    try {
      const user = await this.userService.findByEmail(
        logInDto.email,
        logInDto.role,
      );
      if (user.active === false) {
        throw new UnauthorizedException('Usuario inactivo.');
      }
      if (!user || !user.password) {
        throw new UnauthorizedException('Credenciales inválidas.');
      }
      console.log('user:', user);
      const isMatch = await bcrypt.compare(logInDto.password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Credenciales inválidas.');
      }

      const payload = {
        sub: user.id,
        role: user.role,
        email: user.email,
      };
      const access_token = this.jwtService.sign(payload);

      const activeToken = new ActiveToken();
      activeToken.email = user.email;
      activeToken.token = access_token;
      try {
        await this.activeTokenRepository.save(activeToken);
        await this.logRepository.save(activeToken);
      } catch (error) {
        console.error(
          'Error al guardar el token activo:',
          (error as Error).message,
        );
        throw new InternalServerErrorException(
          'Error interno al guardar el token activo.',
        );
      }
      return {
        access_token: access_token,
      };
    } catch (error) {
      console.error('Error al iniciar sesión:', (error as Error).message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error interno al iniciar sesión. ${(error as Error).message}.`,
      );
    }
  }

  async logOut(logOutDto: LogOutDto, token: string): Promise<any> {
    try {
      // Busca el token activo
      const activeToken = await this.activeTokenRepository.findOne({
        where: { email: logOutDto.email, token },
      });
      if (!activeToken) {
        throw new UnauthorizedException('Sesión no encontrada.');
      }
      await this.blacklistTokenRepository.save({ token: activeToken.token });
      await this.activeTokenRepository.delete(activeToken);
      return {
        message: 'Token desactivado correctamente.',
      };
    } catch (error) {
      console.error('Error al desactivar token:', error.message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error interno al desactivar token. ${error.message}.`,
      );
    }
  }
}
