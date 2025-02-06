import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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
    return this.authService.logIn(logInDto);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil' })
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión' })
  logOut(@Body() logOutDto: LogOutDto) {
    return this.authService.logOut(logOutDto);
  }
}
