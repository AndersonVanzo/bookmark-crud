import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dataTransferObject';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  signin(@Body() dataTransferObject: AuthDto) {
    return this.authService.signin(dataTransferObject);
  }

  @Post('signup')
  signup(@Body() dataTransferObject: AuthDto) {
    return this.authService.signup(dataTransferObject);
  }
}
