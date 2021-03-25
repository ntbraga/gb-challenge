import {
  compareHashString,
  createTokenFromUser,
} from './../../../../utils/index';
import { Validator } from 'class-validator';
import { LoginDTO } from './../../../../data/dto/Login.dto';
import { Dealer } from './../../../../data/entities/Dealer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { MongoRepository } from 'typeorm';

@Injectable()
export class AuthService {
  readonly validator = new Validator();
  constructor(
    @InjectRepository(Dealer)
    private dealerRepository: MongoRepository<Dealer>,
  ) {}

  async login(loginRequest: LoginDTO) {
    const errors = await this.validator.validate(loginRequest);
    if (errors.length > 0) {
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    const dealer = await this.dealerRepository.findOne({
      email: loginRequest.email,
    });

    if (
      !dealer ||
      !(await compareHashString(loginRequest.password, dealer.password))
    ) {
      throw new HttpException(
        'E-mail ou senha inválidos',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = createTokenFromUser(dealer);
    return { ...dealer.toJSON(), token };
  }
}
