import { Validator } from 'class-validator';
import { HttpException } from '@nestjs/common';
import { hashString, createTokenFromUser } from './../../../../utils/index';
import { LoginDTO } from './../../../../data/dto/Login.dto';
import { Dealer } from 'src/data/entities/Dealer.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { MongoRepository } from 'typeorm';
import { ObjectID } from 'mongodb';

describe('AuthService', () => {
  let authService: AuthService;
  let dealerRepositoryMock: MongoRepository<Dealer>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Dealer),
          useValue: {
            findOne: () => null,
          },
        },
        AuthService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    dealerRepositoryMock = module.get(getRepositoryToken(Dealer));
  });

  it('should be defined [authService]', () => {
    expect(authService).toBeDefined();
  });

  it('login should pass', async () => {
    const loginDTO = LoginDTO.createDto('test@test.com.br', 'Test01*');
    const entity = new Dealer();
    entity.id = new ObjectID();
    entity.email = 'test@test.com.br';
    entity.password = await hashString('Test01*');

    jest
      .spyOn(dealerRepositoryMock, 'findOne')
      .mockImplementation(() => Promise.resolve(entity));

    const token = createTokenFromUser(entity);

    await expect(authService.login(loginDTO)).resolves.toHaveProperty(
      'token',
      token,
    );
  });

  it('login should fail [invalid email]', async () => {
    const loginDTO = LoginDTO.createDto('test@test.com.', 'Test01*');
    await expect(authService.login(loginDTO)).rejects.toThrow(HttpException);
  });

  it('login should fail [empty email]', async () => {
    const loginDTO = LoginDTO.createDto('', 'Test01*');
    await expect(authService.login(loginDTO)).rejects.toThrow(HttpException);
  });

  it('login should fail [no email]', async () => {
    const loginDTO = LoginDTO.createDto(undefined, 'Test01*');
    await expect(authService.login(loginDTO)).rejects.toThrow(HttpException);
  });

  it('login should fail [empty password]', async () => {
    const loginDTO = LoginDTO.createDto('test@test.com.br', '');
    await expect(authService.login(loginDTO)).rejects.toThrow(HttpException);
  });

  it('login should fail [no password]', async () => {
    const loginDTO = LoginDTO.createDto('test@test.com.br', undefined);
    await expect(authService.login(loginDTO)).rejects.toThrow(HttpException);
  });

  it('login should fail [email not found]', async () => {
    const loginDTO = LoginDTO.createDto('test@test.com.br', 'Test01*');

    jest
      .spyOn(dealerRepositoryMock, 'findOne')
      .mockImplementation(() => Promise.resolve(undefined));
    await expect(authService.login(loginDTO)).rejects.toThrow(
      'E-mail ou senha inválidos',
    );
  });

  it('login should fail [invalid password]', async () => {
    const loginDTO = LoginDTO.createDto('test@test.com.br', 'Test01*');
    const entity = new Dealer();
    entity.id = new ObjectID();
    entity.email = 'test@test.com.br';
    entity.password = await hashString('Test00*');

    jest
      .spyOn(dealerRepositoryMock, 'findOne')
      .mockImplementation(() => Promise.resolve(entity));

    jest
      .spyOn(dealerRepositoryMock, 'findOne')
      .mockImplementation(() => Promise.resolve(undefined));
    await expect(authService.login(loginDTO)).rejects.toThrow(
      'E-mail ou senha inválidos',
    );
  });
});
