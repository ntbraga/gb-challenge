import { clearCpfMask, hashString } from './../../../../utils/index';
import { CreateDealerDTO } from 'src/data/dto/Dealer.dto';
import { Dealer } from 'src/data/entities/Dealer.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Validator } from 'class-validator';

@Injectable()
export class DealerService {
  readonly validator = new Validator();

  constructor(
    @InjectRepository(Dealer)
    private dealerRepository: MongoRepository<Dealer>,
  ) {}

  async create(dealerDto: CreateDealerDTO) {
    dealerDto.cpf = clearCpfMask(dealerDto.cpf);
    const errors = await this.validator.validate(dealerDto);
    if (errors.length > 0) {
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    dealerDto.password = await hashString(dealerDto.password);
    return this.dealerRepository.save(dealerDto);
  }
}
