import { hashString } from './../src/utils/index';
import { AuthModule } from './../src/modules/auth/auth.module';
import { TypeormForTest, applyGlobalToApp } from './test-helper';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection, MongoRepository } from 'typeorm';
import { Dealer } from 'src/data/entities/Dealer.entity';
import { config as configDotEnv } from 'dotenv-safe';
import { CreateDealerDTO } from 'src/data/dto/Dealer.dto';
configDotEnv();

describe('AuthModule (e2e)', () => {
  let app: INestApplication;
  let dealerRepository: MongoRepository<Dealer>;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeormForTest(), AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    applyGlobalToApp(app);
    await app.init();

    connection = moduleFixture.get<Connection>(Connection);
    dealerRepository = moduleFixture.get(getRepositoryToken(Dealer));
  });

  const createDealer = async (email: string, password: string) => {
    const entity = Dealer.fromDto(
      CreateDealerDTO.createDto(
        'Test dealer',
        email,
        '26121932007',
        await hashString(password),
      ),
    );
    return dealerRepository.save(entity);
  };

  it('POST /auth/login [should do login]', async () => {
    const email = 'test@test.com.br';
    const password = 'Teste01**';
    await createDealer(email, password);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      cpf: '26121932007',
      createdDate: expect.any(String),
      email: 'test@test.com.br',
      id: expect.any(String),
      name: 'Test dealer',
      token: expect.any(String),
      updatedDate: expect.any(String),
    });
  });

  it('POST /auth/login [should have status 400 on empty email]', async () => {
    const email = '';
    const password = 'Teste01**';

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password,
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: ['email should not be empty', 'email must be an email'],
      statusCode: 400,
    });
  });

  it('POST /auth/login [should have status 400 on invalid email]', async () => {
    const email = 'test@test.com.';
    const password = 'Teste01**';

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password,
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: ['email must be an email'],
      statusCode: 400,
    });
  });

  it('POST /auth/login [should have status 400 on empty password]', async () => {
    const email = 'test@test.com.br';
    const password = '';

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password,
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: ['password should not be empty'],
      statusCode: 400,
    });
  });

  it('POST /auth/login [should have status 401 on inexistent dealer email]', async () => {
    const email = 'test@test.com.br';
    const password = 'Teste01**';

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password,
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: 'E-mail ou senha inválidos',
      statusCode: 401,
    });
  });

  it('POST /auth/login [should have status 401 on invalid password]', async () => {
    const email = 'test@test.com.br';
    const password = 'Teste01**';
    await createDealer(email, password);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'Teste02**',
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: 'E-mail ou senha inválidos',
      statusCode: 401,
    });
  });

  beforeEach(async () => {
    await connection.synchronize(true);
  });

  afterEach(async () => {
    await dealerRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });
});
