import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LogInDto } from './dto/log-in.dto';
import { LogOutDto } from './dto/log-out.dto';

@ApiBearerAuth('JWT-auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  signIn(@Body() logInDto: LogInDto) {
    console.log('logInDto:', logInDto);
    return this.authService.logIn(logInDto);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil' })
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión' })
  logOut(@Body() logOutDto: LogOutDto, @Req() req: Request) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) {
      throw new UnauthorizedException('Token no encontrado.');
    }
    return this.authService.logOut(logOutDto, token);
  }
}
