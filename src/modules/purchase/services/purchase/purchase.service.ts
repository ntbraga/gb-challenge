import { Dealer } from 'src/data/entities/Dealer.entity';
import {
  clearCpfMask,
  parseDate,
  validateCpf,
} from './../../../../utils/index';
import { Validator } from 'class-validator';
import {
  CreatePurchaseDTO,
  UpdatePurchaseDTO,
  PurchaseStatus,
  parsePurchaseStatus,
} from './../../../../data/dto/Purchase.dto';
import { Purchase } from './../../../../data/entities/Purchase.entity';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';

@Injectable()
export class PurchaseService {
  readonly validator = new Validator();
  cashbackRules = [
    { min: 0, max: 1000, perc: 0.1 },
    { min: 1000, max: 1500, perc: 0.15 },
    { min: 1500, perc: 0.2 },
  ];
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: MongoRepository<Purchase>,
    @InjectRepository(Dealer)
    private dealerRepository: MongoRepository<Dealer>,
  ) {}

  inBetween(value: number, { min, max }: { min: number; max?: number }) {
    return value > min && (value <= max || !max);
  }

  async applyCashbackRule(
    purchase: Purchase,
  ): Promise<
    any & {
      status: string;
      cashback: number;
      appliedPercentage: string;
    }
  > {
    const rule = this.cashbackRules.find((rule) =>
      this.inBetween(purchase.value, rule),
    );

    return {
      cod: purchase.cod,
      value: purchase.value,
      date: purchase.date,
      appliedPercentage: `${(rule?.perc || 0) * 100}%`,
      cashback: (purchase.value * 10000 * (rule?.perc || 0)) / 10000,
      status: parsePurchaseStatus(purchase.status),
    };
  }

  async validateDealerExists(cpf: string): Promise<boolean> {
    return (await this.dealerRepository.count({ cpf })) === 1;
  }

  statusByCpf(cpf: string): PurchaseStatus {
    const approveCpf = (process.env.AUTO_APPROVE_CPF || '').split(',');
    if (approveCpf.includes(cpf)) {
      return PurchaseStatus.APPROVED;
    }
    return PurchaseStatus.VALIDATING;
  }

  async create(purchaseDto: CreatePurchaseDTO) {
    purchaseDto.cpf = clearCpfMask(purchaseDto.cpf);
    const errors = await this.validator.validate(purchaseDto);
    if (errors.length > 0) {
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    if (!(await this.validateDealerExists(purchaseDto.cpf))) {
      throw new HttpException(
        `Não é possível criar esta compra, revendedor com o cpf ${purchaseDto.cpf} não existe`,
        HttpStatus.BAD_REQUEST,
      );
    }

    purchaseDto.status = this.statusByCpf(purchaseDto.cpf);
    const entity = this.purchaseRepository.create(purchaseDto);
    return this.purchaseRepository.save(entity);
  }

  async update(purchaseDto: UpdatePurchaseDTO) {
    purchaseDto.cpf = clearCpfMask(purchaseDto.cpf);
    const errors = await this.validator.validate(purchaseDto);
    if (errors.length > 0) {
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    const purchase = await this.purchaseRepository.findOne({
      cod: purchaseDto.cod,
      cpf: purchaseDto.cpf,
    });

    if (!purchase) {
      throw new HttpException(
        `Não foi encontrada uma compra com código: ${purchaseDto.cod}`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (purchase.status !== PurchaseStatus.VALIDATING) {
      throw new HttpException(
        'Não é possível atualizar esta compra, status diferente de "Em validação"',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (purchaseDto.value) {
      purchase.value = purchaseDto.value;
    }
    if (purchaseDto.date) {
      purchase.date = purchaseDto.date;
    }

    return this.purchaseRepository.save(purchase);
  }

  async remove(cpf: string, cod: string) {
    cpf = clearCpfMask(cpf);
    if (!cpf || !(await validateCpf(cpf))) {
      throw new HttpException('Cpf inválido', HttpStatus.BAD_REQUEST);
    }

    if (!cod) {
      throw new HttpException('Código inválido', HttpStatus.BAD_REQUEST);
    }

    const purchase = await this.purchaseRepository.findOne({
      cod,
      cpf,
    });

    if (!purchase) {
      throw new HttpException(
        `Não foi encontrada uma compra com código: ${cod}`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (purchase.status !== PurchaseStatus.VALIDATING) {
      throw new HttpException(
        'Não é possível excluir esta compra, status diferente de "Em validação"',
        HttpStatus.BAD_REQUEST,
      );
    }

    const deleted = await this.purchaseRepository.remove(purchase);
    if (!deleted) {
      throw new HttpException(
        'Erro ao excluir compra.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(cpf: string) {
    cpf = clearCpfMask(cpf);

    if (!(await validateCpf(cpf))) {
      throw new HttpException('Cpf inválido', HttpStatus.BAD_REQUEST);
    }

    const purchases = await this.purchaseRepository.find({
      cpf,
    });

    return Promise.all(
      purchases.map(async (purchase) => this.applyCashbackRule(purchase)),
    );
  }
}
