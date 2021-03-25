import { CreateDealerDTO } from 'src/data/dto/Dealer.dto';
import { Column, Index, Entity } from 'typeorm';
import { DefaultEntity } from './Default.entity';

@Entity()
export class Dealer extends DefaultEntity {
  @Column()
  name: string;

  @Column()
  @Index({ unique: true })
  email: string;

  @Column()
  @Index({ unique: true })
  cpf: string;

  @Column()
  password: string;

  toJSON() {
    return { ...this, password: undefined };
  }

  static fromDto(dto: CreateDealerDTO) {
    const entity = new Dealer();
    entity.name = dto.name;
    entity.email = dto.email;
    entity.cpf = dto.cpf;
    entity.password = dto.password;
    return entity;
  }
}
