import { AuthService } from './../../services/auth/auth.service';
import { LoginDTO } from './../../../../data/dto/Login.dto';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginRequest: LoginDTO) {
    return this.authService.login(loginRequest);
  }
}
