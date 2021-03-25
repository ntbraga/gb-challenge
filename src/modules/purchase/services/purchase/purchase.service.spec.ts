import { HttpException } from '@nestjs/common';
import {
  CreatePurchaseDTO,
  UpdatePurchaseDTO,
} from './../../../../data/dto/Purchase.dto';
import { Dealer } from 'src/data/entities/Dealer.entity';
import { Purchase } from './../../../../data/entities/Purchase.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseService } from './purchase.service';
import { PurchaseStatus } from 'src/data/dto/Purchase.dto';
import { DeleteResult, MongoRepository } from 'typeorm';

describe('PurchaseService', () => {
  let purchaseService: PurchaseService;
  let purchaseRepositoryMock: MongoRepository<Purchase>;
  let dealerRepositoryMock: MongoRepository<Dealer>;
  const cashbackRules = [
    { min: 0, max: 1000, perc: 0.1 },
    { min: 1000, max: 1500, perc: 0.15 },
    { min: 1500, perc: 0.2 },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Purchase),
          useValue: {
            findOne: () => null,
            save: () => null,
            remove: () => null,
            find: () => null,
            create: () => null,
          },
        },
        {
          provide: getRepositoryToken(Dealer),
          useValue: {
            count: () => null,
          },
        },
        PurchaseService,
      ],
    }).compile();

    purchaseService = module.get<PurchaseService>(PurchaseService);
    purchaseRepositoryMock = module.get(getRepositoryToken(Purchase));
    dealerRepositoryMock = module.get(getRepositoryToken(Dealer));
    purchaseService.cashbackRules = cashbackRules;
  });

  it('should be defined', () => {
    expect(purchaseService).toBeDefined();
  });

  it('value should be in between with min and max', () => {
    expect(purchaseService.inBetween(100, { min: 0, max: 1000 })).toBe(true);
  });

  it('value should not be in between with min and max', () => {
    expect(purchaseService.inBetween(1001, { min: 0, max: 1000 })).toBe(false);
  });

  it('value should be in between without max', () => {
    expect(purchaseService.inBetween(1501, { min: 1500 })).toBe(true);
  });

  it('value should not be in between without max', () => {
    expect(purchaseService.inBetween(1500, { min: 1500 })).toBe(false);
  });

  it('should not find cashback rule', async () => {
    purchaseService.cashbackRules = [];
    const purchase = new Purchase();
    purchase.cod = '001';
    purchase.value = 100;
    purchase.status = PurchaseStatus.APPROVED;
    const response = await purchaseService.applyCashbackRule(purchase);

    expect(response).toBeDefined();
    expect(response.cashback).toBe(0);
    expect(response.appliedPercentage).toBe('0%');
  });

  it('apply cashback rule 10%', async () => {
    const purchase = new Purchase();
    purchase.cod = '001';
    purchase.value = 100;
    purchase.status = PurchaseStatus.APPROVED;
    const response = await purchaseService.applyCashbackRule(purchase);

    expect(response).toBeDefined();
    expect(response.cashback).toBe(purchase.value * 0.1);
    expect(response.appliedPercentage).toBe('10%');
  });

  it('apply cashback rule 15%', async () => {
    const purchase = new Purchase();
    purchase.cod = '001';
    purchase.value = 1200;
    purchase.status = PurchaseStatus.APPROVED;
    const response = await purchaseService.applyCashbackRule(purchase);

    expect(response).toBeDefined();
    expect(response.cashback).toBe(purchase.value * 0.15);
    expect(response.appliedPercentage).toBe('15%');
  });

  it('apply cashback rule 20%', async () => {
    const purchase = new Purchase();
    purchase.cod = '001';
    purchase.value = 1800;
    purchase.status = PurchaseStatus.APPROVED;
    const response = await purchaseService.applyCashbackRule(purchase);

    expect(response).toBeDefined();
    expect(response.cashback).toBe(purchase.value * 0.2);
    expect(response.appliedPercentage).toBe('20%');
  });

  it('should return valid status name for APPROVED', async () => {
    const purchase = new Purchase();
    purchase.cod = '001';
    purchase.value = 100;
    purchase.status = PurchaseStatus.APPROVED;
    const response = await purchaseService.applyCashbackRule(purchase);

    expect(response).toBeDefined();
    expect(response.cashback).toBe(purchase.value * 0.1);
    expect(response.appliedPercentage).toBe('10%');
    expect(response.status).toBe('Aprovado');
  });

  it('should return valid status name for INVALID', async () => {
    const purchase = new Purchase();
    purchase.cod = '001';
    purchase.value = 100;
    purchase.status = PurchaseStatus.INVALID;
    const response = await purchaseService.applyCashbackRule(purchase);

    expect(response).toBeDefined();
    expect(response.cashback).toBe(purchase.value * 0.1);
    expect(response.appliedPercentage).toBe('10%');
    expect(response.status).toBe('Inválido');
  });

  it('should return valid status name for VALIDATING', async () => {
    const purchase = new Purchase();
    purchase.cod = '001';
    purchase.value = 100;
    purchase.status = PurchaseStatus.VALIDATING;
    const response = await purchaseService.applyCashbackRule(purchase);

    expect(response).toBeDefined();
    expect(response.cashback).toBe(purchase.value * 0.1);
    expect(response.appliedPercentage).toBe('10%');
    expect(response.status).toBe('Em Validação');
  });

  it('dealer should exists by cpf', async () => {
    jest
      .spyOn(dealerRepositoryMock, 'count')
      .mockImplementation(() => Promise.resolve(1));

    expect(purchaseService.validateDealerExists('93106789093')).resolves.toBe(
      true,
    );
  });

  it('dealer should not exists by cpf', async () => {
    jest
      .spyOn(dealerRepositoryMock, 'count')
      .mockImplementation(() => Promise.resolve(0));

    expect(purchaseService.validateDealerExists('93106789093')).resolves.toBe(
      false,
    );
  });

  it('should return APPROVED for cpf', () => {
    process.env.AUTO_APPROVE_CPF = '93106789093';
    expect(purchaseService.statusByCpf('93106789093')).toBe(
      PurchaseStatus.APPROVED,
    );
  });

  it('should return APPROVED for cpf', () => {
    process.env.AUTO_APPROVE_CPF = '93106789093,80083900004';
    expect(purchaseService.statusByCpf('93106789093')).toBe(
      PurchaseStatus.APPROVED,
    );
    expect(purchaseService.statusByCpf('80083900004')).toBe(
      PurchaseStatus.APPROVED,
    );
  });

  it('should return VALIDATING for cpf', () => {
    process.env.AUTO_APPROVE_CPF = '93106789093,80083900004';
    expect(purchaseService.statusByCpf('25114416081')).toBe(
      PurchaseStatus.VALIDATING,
    );
  });

  it('should create purchase', async () => {
    const dto = CreatePurchaseDTO.createDto(
      '001',
      1200.3,
      '24/03/2021',
      '931.067.890-93',
    );

    const entity = Purchase.fromDto(dto);

    jest
      .spyOn(dealerRepositoryMock, 'count')
      .mockImplementation(() => Promise.resolve(1));
    jest
      .spyOn(purchaseRepositoryMock, 'create')
      .mockImplementation(() => entity);
    jest
      .spyOn(purchaseRepositoryMock, 'save')
      .mockImplementation(() => Promise.resolve(entity));

    await expect(purchaseService.create(dto)).resolves.toBe(entity);
  });

  it('should throw on create [no cod]', async () => {
    const dto = CreatePurchaseDTO.createDto(
      undefined,
      1200.3,
      '24/03/2021',
      '931.067.890-93',
    );

    await expect(purchaseService.create(dto)).rejects.toThrow(HttpException);
  });

  it('should throw on create [no value]', async () => {
    const dto = CreatePurchaseDTO.createDto(
      '001',
      undefined,
      '24/03/2021',
      '931.067.890-93',
    );

    await expect(purchaseService.create(dto)).rejects.toThrow(HttpException);
  });

  it('should throw on create [no date]', async () => {
    const dto = CreatePurchaseDTO.createDto(
      '001',
      1200.3,
      undefined,
      '931.067.890-93',
    );

    await expect(purchaseService.create(dto)).rejects.toThrow(HttpException);
  });

  it('should throw on create [no cpf]', async () => {
    const dto = CreatePurchaseDTO.createDto(
      '001',
      1200.3,
      '24/03/2021',
      undefined,
    );

    await expect(purchaseService.create(dto)).rejects.toThrow(HttpException);
  });

  it('should throw on create [dealer dont exists]', async () => {
    const dto = CreatePurchaseDTO.createDto(
      '001',
      1200.3,
      '24/03/2021',
      '931.067.890-93',
    );

    jest
      .spyOn(dealerRepositoryMock, 'count')
      .mockImplementation(() => Promise.resolve(0));

    await expect(purchaseService.create(dto)).rejects.toThrow(
      `Não é possível criar esta compra, revendedor com o cpf ${dto.cpf} não existe`,
    );
  });

  it('should throw on create [insert with status]', async () => {
    const dto = CreatePurchaseDTO.createDto(
      '001',
      1200.3,
      '24/03/2021',
      '931.067.890-93',
      PurchaseStatus.APPROVED,
    );

    await expect(purchaseService.create(dto)).rejects.toThrow(HttpException);
  });

  it('should update purchase [value]', async () => {
    const dto = UpdatePurchaseDTO.createDto(
      '001',
      1200.3,
      undefined,
      '931.067.890-93',
    );

    const entity = Purchase.fromDto(dto);
    entity.status = PurchaseStatus.VALIDATING;

    jest
      .spyOn(purchaseRepositoryMock, 'findOne')
      .mockImplementation(() => Promise.resolve(entity));
    jest
      .spyOn(purchaseRepositoryMock, 'create')
      .mockImplementation(() => entity);
    jest
      .spyOn(purchaseRepositoryMock, 'save')
      .mockImplementation(() => Promise.resolve(entity));

    await expect(purchaseService.update(dto)).resolves.toBe(entity);
  });

  it('should update purchase [date]', async () => {
    const dto = UpdatePurchaseDTO.createDto(
      '001',
      undefined,
      '24/03/2021',
      '931.067.890-93',
    );

    const entity = Purchase.fromDto(dto);
    entity.status = PurchaseStatus.VALIDATING;

    jest
      .spyOn(purchaseRepositoryMock, 'findOne')
      .mockImplementation(() => Promise.resolve(entity));
    jest
      .spyOn(purchaseRepositoryMock, 'save')
      .mockImplementation(() => Promise.resolve(entity));
    jest
      .spyOn(purchaseRepositoryMock, 'create')
      .mockImplementation(() => entity);

    await expect(purchaseService.update(dto)).resolves.toBe(entity);
  });

  it('should throw on update [no cod]', async () => {
    const dto = UpdatePurchaseDTO.createDto(
      undefined,
      undefined,
      '24/03/2021',
      '931.067.890-93',
    );

    await expect(purchaseService.update(dto)).rejects.toThrow(HttpException);
  });

  it('should throw on update [no cpf]', async () => {
    const dto = UpdatePurchaseDTO.createDto(
      '001',
      undefined,
      '24/03/2021',
      undefined,
    );

    await expect(purchaseService.update(dto)).rejects.toThrow(HttpException);
  });

  it('should not find purchase to update', async () => {
    const dto = UpdatePurchaseDTO.createDto(
      '001',
      undefined,
      '24/03/2021',
      '931.067.890-93',
    );

    jest
      .spyOn(purchaseRepositoryMock, 'findOne')
      .mockImplementation(() => Promise.resolve(undefined));

    await expect(purchaseService.update(dto)).rejects.toThrow(
      `Não foi encontrada uma compra com código: ${dto.cod}`,
    );
  });

  it('should throw on update APPROVED', async () => {
    const updateDto = UpdatePurchaseDTO.createDto(
      '001',
      undefined,
      '24/03/2021',
      '931.067.890-93',
    );

    const entity = new Purchase();
    entity.status = PurchaseStatus.APPROVED;

    jest
      .spyOn(dealerRepositoryMock, 'count')
      .mockImplementation(() => Promise.resolve(1));
    jest
      .spyOn(purchaseRepositoryMock, 'findOne')
      .mockImplementation(() => Promise.resolve(entity));

    await expect(purchaseService.update(updateDto)).rejects.toThrow(
      'Não é possível atualizar esta compra, status diferente de "Em validação"',
    );
  });

  it('should throw on update INVALID', async () => {
    const updateDto = UpdatePurchaseDTO.createDto(
      '001',
      undefined,
      '24/03/2021',
      '931.067.890-93',
    );

    const entity = new Purchase();
    entity.status = PurchaseStatus.INVALID;

    jest
      .spyOn(dealerRepositoryMock, 'count')
      .mockImplementation(() => Promise.resolve(1));
    jest
      .spyOn(purchaseRepositoryMock, 'findOne')
      .mockImplementation(() => Promise.resolve(entity));

    await expect(purchaseService.update(updateDto)).rejects.toThrow(
      'Não é possível atualizar esta compra, status diferente de "Em validação"',
    );
  });

  it('should remove purchase', async () => {
    const entity = new Purchase();
    entity.cod = '001';
    entity.status = PurchaseStatus.VALIDATING;

    jest
      .spyOn(purchaseRepositoryMock, 'findOne')
      .mockImplementation(() => Promise.resolve(entity));

    jest
      .spyOn(purchaseRepositoryMock, 'remove')
      .mockImplementation(() => Promise.resolve(entity));

    await expect(
      purchaseService.remove('93106789093', entity.cod),
    ).resolves.toBe(undefined);
  });

  it('should not find purchase to remove', async () => {
    jest
      .spyOn(purchaseRepositoryMock, 'findOne')
      .mockImplementation(() => Promise.resolve(undefined));
    const cod = '001';
    expect(purchaseService.remove('93106789093', cod)).rejects.toThrow(
      `Não foi encontrada uma compra com código: ${cod}`,
    );
  });

  it('should throw invalid cod', async () => {
    const cod = undefined;
    expect(purchaseService.remove('93106789093', cod)).rejects.toThrow(
      'Código inválido',
    );
  });

  it('should throw on remove APPROVED', async () => {
    const entity = new Purchase();
    entity.cod = '001';
    entity.status = PurchaseStatus.APPROVED;

    jest
      .spyOn(purchaseRepositoryMock, 'findOne')
      .mockImplementation(() => Promise.resolve(entity));

    expect(purchaseService.remove('93106789093', entity.cod)).rejects.toThrow(
      'Não é possível excluir esta compra, status diferente de "Em validação"',
    );
  });

  it('should throw on remove INVALID', async () => {
    const entity = new Purchase();
    entity.cod = '001';
    entity.status = PurchaseStatus.INVALID;

    jest
      .spyOn(purchaseRepositoryMock, 'findOne')
      .mockImplementation(() => Promise.resolve(entity));

    expect(purchaseService.remove('93106789093', entity.cod)).rejects.toThrow(
      'Não é possível excluir esta compra, status diferente de "Em validação"',
    );
  });

  it('should throw on empty cpf', async () => {
    expect(purchaseService.remove(undefined, '001')).rejects.toThrow(
      'Cpf inválido',
    );
  });

  it('should throw on invalid cpf', async () => {
    expect(purchaseService.remove('00000000000', '001')).rejects.toThrow(
      'Cpf inválido',
    );
  });

  it('should throw on invalid cpf dv', async () => {
    expect(purchaseService.remove('931067890', '001')).rejects.toThrow(
      'Cpf inválido',
    );
  });

  it('should remove purchase', async () => {
    const entity = new Purchase();
    entity.cod = '001';
    entity.status = PurchaseStatus.VALIDATING;

    jest
      .spyOn(purchaseRepositoryMock, 'findOne')
      .mockImplementation(() => Promise.resolve(entity));

    jest
      .spyOn(purchaseRepositoryMock, 'remove')
      .mockImplementation(() => Promise.resolve(undefined));

    await expect(
      purchaseService.remove('93106789093', entity.cod),
    ).rejects.toThrow('Erro ao excluir compra.');
  });

  it('should throw invalid cpf', async () => {
    await expect(purchaseService.findAll('00000000000')).rejects.toThrow(
      'Cpf inválido',
    );
  });

  it('should find 0 results', async () => {
    jest
      .spyOn(purchaseRepositoryMock, 'find')
      .mockImplementation(() => Promise.resolve([]));

    await expect(
      purchaseService.findAll('931.067.890-93'),
    ).resolves.toHaveLength(0);
  });

  it('should find 3 results', async () => {
    const entity1 = Purchase.createEntity(
      '001',
      100,
      '24/03/2021',
      '93106789093',
      PurchaseStatus.VALIDATING,
    );
    const entity2 = Purchase.createEntity(
      '002',
      1200,
      '24/03/2021',
      '93106789093',
      PurchaseStatus.APPROVED,
    );
    const entity3 = Purchase.createEntity(
      '003',
      1800,
      '24/03/2021',
      '93106789093',
      PurchaseStatus.INVALID,
    );
    jest
      .spyOn(purchaseRepositoryMock, 'find')
      .mockImplementation(() => Promise.resolve([entity1, entity2, entity3]));

    const result = await purchaseService.findAll('931.067.890-93');

    expect(result).toBeDefined();
    expect(result).toHaveLength(3);
    const r1 = result[0];
    const r2 = result[1];
    const r3 = result[2];

    expect(r1).toBeDefined();
    expect(r1.cod).toBe('001');
    expect(r1.value).toBe(100);
    expect(r1.appliedPercentage).toBe('10%');
    expect(r1.cashback).toBe(100 * 0.1);
    expect(r1.status).toBe('Em Validação');

    expect(r2).toBeDefined();
    expect(r2.cod).toBe('002');
    expect(r2.value).toBe(1200);
    expect(r2.appliedPercentage).toBe('15%');
    expect(r2.cashback).toBe(1200 * 0.15);
    expect(r2.status).toBe('Aprovado');

    expect(r3).toBeDefined();
    expect(r3.cod).toBe('003');
    expect(r3.value).toBe(1800);
    expect(r3.appliedPercentage).toBe('20%');
    expect(r3.cashback).toBe(1800 * 0.2);
    expect(r3.status).toBe('Inválido');
  });
});
