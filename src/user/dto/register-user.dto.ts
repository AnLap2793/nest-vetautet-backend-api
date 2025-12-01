import { IsNotEmpty, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({ message: 'username not empty' })
  accountname: string;
  @IsNotEmpty({ message: 'password not empty' })
  @MinLength(8, { message: 'password > 8 characters ' })
  password: string;
}
