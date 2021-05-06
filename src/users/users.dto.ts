import {
  IsNotEmpty,
  IsEmail,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import * as dict from './users.dictionary.json';
import { getMessageAsString } from '../shared/utils';

export class UserDto {
  @ApiProperty()
  @IsEmail(this, getMessageAsString(dict.validator.email.IsEmail))
  @IsNotEmpty(getMessageAsString(dict.validator.email.IsNotEmpty))
  email: string;

  @ApiProperty()
  @Matches(
    /(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]/,
    getMessageAsString(dict.validator.password.Matches),
  )
  @Length(6, 20, getMessageAsString(dict.validator.password.Length))
  @IsNotEmpty(getMessageAsString(dict.validator.password.IsNotEmpty))
  password: string;
}

export class UserConfirmDto {
  @ApiProperty()
  @IsString(getMessageAsString(dict.validator.token.IsString))
  @IsNotEmpty(getMessageAsString(dict.validator.token.IsNotEmpty))
  token: string;
}

export class UserForgotDto {
  @ApiProperty()
  @IsEmail(this, getMessageAsString(dict.validator.email.IsEmail))
  @IsNotEmpty(getMessageAsString(dict.validator.email.IsNotEmpty))
  email: string;
}

export class UserResetDto {
  @ApiProperty()
  @Matches(
    /(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]/,
    getMessageAsString(dict.validator.password.Matches),
  )
  @Length(6, 20, getMessageAsString(dict.validator.password.Length))
  @IsNotEmpty(getMessageAsString(dict.validator.password.IsNotEmpty))
  password: string;

  @ApiProperty()
  @IsString(getMessageAsString(dict.validator.token.IsString))
  @IsNotEmpty(getMessageAsString(dict.validator.token.IsNotEmpty))
  confirm_token: string;
}

export class UserProviderDto {
  @ApiProperty()
  @IsNotEmpty(getMessageAsString(dict.validator.code.IsNotEmpty))
  code: string;

  @ApiProperty()
  @IsNotEmpty(getMessageAsString(dict.validator.provider.IsNotEmpty))
  provider: string;
}
