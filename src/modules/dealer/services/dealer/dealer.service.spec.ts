import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DealerService } from './dealer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Dealer } from 'src/data/entities/Dealer.entity';
import { CreateDealerDTO } from 'src/data/dto/Dealer.dto';

describe('DealerService', () => {
  let dealerService: DealerService;
  let dealerRepositoryMock: MongoRepository<Dealer>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Dealer),
          useValue: {
            save: () => null,
          },
        },
        DealerService,
      ],
    }).compile();

    dealerService = module.get<DealerService>(DealerService);
    dealerRepositoryMock = module.get(getRepositoryToken(Dealer));
  });

  it('should be defined [dealerService]', () => {
    expect(dealerService).toBeDefined();
  });

  it('should be defined [dealerRepositoryMock]', () => {
    expect(dealerRepositoryMock).toBeDefined();
  });

  it('should create dealer', async () => {
    const dto = CreateDealerDTO.createDto(
      'Test user',
      'test@test.com.br',
      '931.067.890-93',
      'Teste01*',
    );
    const entity = Dealer.fromDto(dto);

    jest
      .spyOn(dealerRepositoryMock, 'save')
      .mockImplementation(() => Promise.resolve(entity));
    await expect(dealerService.create(dto)).resolves.toBe(entity);
  });

  it('should throw on create [no name]', async () => {
    const dto = CreateDealerDTO.createDto(
      undefined,
      'test@test.com.br',
      '931.067.890-93',
      'Teste01*',
    );
    const entity = Dealer.fromDto(dto);

    jest
      .spyOn(dealerRepositoryMock, 'save')
      .mockImplementation(() => Promise.resolve(entity));
    await expect(dealerService.create(dto)).rejects.toThrow(HttpException);
  });

  it('should throw on create [no email]', async () => {
    const dto = CreateDealerDTO.createDto(
      'Test user',
      undefined,
      '931.067.890-93',
      'Teste01*',
    );
    const entity = Dealer.fromDto(dto);

    jest
      .spyOn(dealerRepositoryMock, 'save')
      .mockImplementation(() => Promise.resolve(entity));
    await expect(dealerService.create(dto)).rejects.toThrow(HttpException);
  });

  it('should throw on create [invalid email]', async () => {
    const dto = CreateDealerDTO.createDto(
      'Test user',
      'test@test.com.',
      '931.067.890-93',
      'Teste01*',
    );
    const entity = Dealer.fromDto(dto);

    jest
      .spyOn(dealerRepositoryMock, 'save')
      .mockImplementation(() => Promise.resolve(entity));
    await expect(dealerService.create(dto)).rejects.toThrow(HttpException);
  });

  it('should throw on create [no cpf]', async () => {
    const dto = CreateDealerDTO.createDto(
      'Test user',
      'test@test.com.br',
      undefined,
      'Teste01*',
    );
    const entity = Dealer.fromDto(dto);

    jest
      .spyOn(dealerRepositoryMock, 'save')
      .mockImplementation(() => Promise.resolve(entity));
    await expect(dealerService.create(dto)).rejects.toThrow(HttpException);
  });

  it('should throw on create [invalid cpf]', async () => {
    const dto = CreateDealerDTO.createDto(
      'Test user',
      'test@test.com.br',
      '111.111.111-11',
      'Teste01*',
    );
    const entity = Dealer.fromDto(dto);

    jest
      .spyOn(dealerRepositoryMock, 'save')
      .mockImplementation(() => Promise.resolve(entity));
    await expect(dealerService.create(dto)).rejects.toThrow(HttpException);
  });

  it('should throw on create [no password]', async () => {
    const dto = CreateDealerDTO.createDto(
      'Test user',
      'test@test.com.br',
      '931.067.890-93',
      undefined,
    );
    const entity = Dealer.fromDto(dto);

    jest
      .spyOn(dealerRepositoryMock, 'save')
      .mockImplementation(() => Promise.resolve(entity));
    await expect(dealerService.create(dto)).rejects.toThrow(HttpException);
  });
});
