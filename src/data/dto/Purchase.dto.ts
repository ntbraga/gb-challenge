import { IsLocalDate, IsValidCpf } from 'src/utils';
import {
  IsEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Matches,
  Min,
} from 'class-validator';

export enum PurchaseStatus {
  VALIDATING = 'VALIDATING',
  APPROVED = 'APPROVED',
  INVALID = 'INVALID',
}

export const parsePurchaseStatus = (type: PurchaseStatus) => {
  switch (type) {
    case PurchaseStatus.VALIDATING:
      return 'Em Validação';
    case PurchaseStatus.APPROVED:
      return 'Aprovado';
    case PurchaseStatus.INVALID:
      return 'Inválido';
  }
};

export class CreatePurchaseDTO {
  @IsNotEmpty()
  cod: string;

  @IsNotEmpty()
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  value: number;

  @IsNotEmpty()
  @IsLocalDate()
  date: string;

  @IsNotEmpty()
  @Matches(/^(\d{3})[.]?(\d{3})[.]?(\d{3})[-]?(\d{2})$/)
  @IsValidCpf()
  cpf: string;

  @IsEmpty()
  status: PurchaseStatus;

  static createDto(
    cod: string,
    value: number,
    date: string,
    cpf: string,
    status?: PurchaseStatus,
  ) {
    const dto = new CreatePurchaseDTO();
    dto.cod = cod;
    dto.value = value;
    dto.date = date;
    dto.cpf = cpf;
    dto.status = status;
    return dto;
  }
}

export class UpdatePurchaseDTO {
  @IsNotEmpty()
  cod: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  value: number;

  @IsLocalDate()
  @IsOptional()
  date: string;

  @Matches(/^(\d{3})[.]?(\d{3})[.]?(\d{3})[-]?(\d{2})$/)
  @IsValidCpf()
  @IsNotEmpty()
  cpf: string;

  @IsEmpty()
  status: PurchaseStatus;

  static createDto(
    cod: string,
    value: number,
    date: string,
    cpf: string,
    status?: PurchaseStatus,
  ) {
    const dto = new UpdatePurchaseDTO();
    dto.cod = cod;
    dto.value = value;
    dto.date = date;
    dto.cpf = cpf;
    dto.status = status;
    return dto;
  }
}
