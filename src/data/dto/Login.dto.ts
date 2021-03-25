import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  static createDto(email: string, password: string) {
    const dto = new LoginDTO();
    dto.email = email;
    dto.password = password;
    return dto;
  }
}
