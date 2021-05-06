import {
  Body,
  Controller,
  Post,
  UsePipes,
  Param,
  UseInterceptors,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  UserDto,
  UserProviderDto,
  UserConfirmDto,
  UserForgotDto,
  UserResetDto,
} from './users.dto';

import { UsersService } from './users.service';
import { MailInterceptor } from '../shared/mail/mail.interceptor';
import { LangInterceptor } from '../shared/lang.interceptor';
import { ValidationPipe } from '../shared/validation.pipe';

@ApiBearerAuth()
@ApiTags('users')
@Controller()
@UseInterceptors(MailInterceptor, LangInterceptor)
@UsePipes(ValidationPipe)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('auth/register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() data: UserDto) {
    return this.usersService.register(data);
  }

  @Post('auth/confirm')
  @ApiOperation({
    summary:
      "Validates the token sent in the email and activates the user's account",
  })
  confirm(@Body() data: UserConfirmDto) {
    return this.usersService.confirm(data);
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'Login user' })
  login(@Body() data: UserDto) {
    return this.usersService.login(data);
  }

  @Post('auth/forgot')
  @ApiOperation({ summary: 'Send a token via email to reset the password' })
  forgot(@Body() data: UserForgotDto) {
    return this.usersService.forgot(data);
  }

  @Post('auth/reset')
  @ApiOperation({ summary: 'Change user password' })
  reset(@Body() data: UserResetDto) {
    return this.usersService.reset(data);
  }

  @Post('auth/connect/:provider')
  @ApiOperation({ summary: 'Sign in with social media' })
  connect(@Body('code') code: string, @Param('provider') provider: string) {
    const data: UserProviderDto = { code, provider };
    return this.usersService.connect(data);
  }
}
