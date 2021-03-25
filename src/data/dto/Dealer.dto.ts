import { IsNotEmpty, IsEmail, Matches } from 'class-validator';
import { IsValidCpf } from 'src/utils';
export class CreateDealerDTO {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Matches(/^(\d{3})[.]?(\d{3})[.]?(\d{3})[-]?(\d{2})$/)
  @IsValidCpf()
  cpf: string;

  @IsNotEmpty()
  password: string;

  static createDto(name: string, email: string, cpf: string, password: string) {
    const dto = new CreateDealerDTO();
    dto.name = name;
    dto.email = email;
    dto.cpf = cpf;
    dto.password = password;
    return dto;
  }
}
