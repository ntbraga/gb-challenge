import { parseDate } from './../../utils/index';
import { PurchaseStatus, CreatePurchaseDTO } from './../dto/Purchase.dto';
import { Column, Entity, Index, Unique } from 'typeorm';
import { DefaultEntity } from './Default.entity';

@Entity()
@Unique(['cod', 'cpf'])
export class Purchase extends DefaultEntity {
  @Column()
  @Index()
  cod: string;

  @Column('decimal')
  value: number;

  @Column()
  date: string;

  @Column()
  @Index()
  cpf: string;

  @Column()
  status: PurchaseStatus;

  static fromDto(dto: CreatePurchaseDTO) {
    const entity = new Purchase();
    entity.cod = dto.cod;
    entity.value = dto.value;
    entity.date = dto.date;
    entity.cpf = dto.cpf;
    entity.status = dto.status;
    return entity;
  }

  static createEntity(
    cod: string,
    value: number,
    date: string,
    cpf: string,
    status: PurchaseStatus,
  ) {
    const entity = new Purchase();

    entity.cod = cod;
    entity.value = value;
    entity.date = date;
    entity.cpf = cpf;
    entity.status = status;

    return entity;
  }
}
