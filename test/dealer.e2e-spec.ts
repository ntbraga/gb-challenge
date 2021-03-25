import { TypeormForTest, applyGlobalToApp } from './test-helper';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection, MongoRepository } from 'typeorm';
import { Dealer } from 'src/data/entities/Dealer.entity';
import { DealerModule } from 'src/modules/dealer/dealer.module';
import { config as configDotEnv } from 'dotenv-safe';
configDotEnv();

describe('DealerModule (e2e)', () => {
  let app: INestApplication;
  let dealerRepository: MongoRepository<Dealer>;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeormForTest(), DealerModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    applyGlobalToApp(app);
    await app.init();

    connection = moduleFixture.get<Connection>(Connection);
    dealerRepository = moduleFixture.get(getRepositoryToken(Dealer));
  });

  beforeEach(async () => {
    await connection.synchronize(true);
  });

  it('should be defined', async () => {
    expect(app).toBeDefined();
    expect(connection).toBeDefined();
    expect(dealerRepository).toBeDefined();
  });

  it('POST /dealers [should create dealer]', async () => {
    const dealerRequest = {
      name: 'Leonardo Iago Jesus',
      email: 'leonardo@gmail.com',
      cpf: '261.219.320-07',
      password: 'Teste01**',
    };

    const response = await request(app.getHttpServer())
      .post('/dealers')
      .send(dealerRequest);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      name: 'Leonardo Iago Jesus',
      email: 'leonardo@gmail.com',
      cpf: '26121932007',
      password: expect.any(String),
      id: expect.any(String),
      createdDate: expect.any(String),
      updatedDate: expect.any(String),
      deletedDate: null,
    });
  });

  it('POST /dealers [should have status 400 on duplicated email]', async () => {
    const dealerRequest1 = {
      name: 'Leonardo Iago Jesus',
      email: 'leonardo@gmail.com',
      cpf: '261.219.320-07',
      password: 'Teste01**',
    };

    const dealerRequest2 = {
      name: 'Jaqueline Tereza Melo',
      email: 'leonardo@gmail.com',
      cpf: '191.551.238-72',
      password: 'Teste02**',
    };

    const response = await request(app.getHttpServer())
      .post('/dealers')
      .send(dealerRequest1);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      name: 'Leonardo Iago Jesus',
      email: 'leonardo@gmail.com',
      cpf: '26121932007',
      password: expect.any(String),
      id: expect.any(String),
      createdDate: expect.any(String),
      updatedDate: expect.any(String),
      deletedDate: null,
    });

    const response2 = await request(app.getHttpServer())
      .post('/dealers')
      .send(dealerRequest2);

    expect(response2.status).toBe(400);
    expect(response2.body).toEqual({
      type: 'MongoError',
      value: {
        field: 'IDX',
        value: ': "leonardo@gmail.com"',
        type: 'unique',
      },
    });
  });

  it('POST /dealers [should have status 400 on duplicated cpf]', async () => {
    const dealerRequest1 = {
      name: 'Leonardo Iago Jesus',
      email: 'leonardo@gmail.com',
      cpf: '261.219.320-07',
      password: 'Teste01**',
    };

    const dealerRequest2 = {
      name: 'Jaqueline Tereza Melo',
      email: 'jaqueline@gmail.com',
      cpf: '261.219.320-07',
      password: 'Teste02**',
    };

    const response = await request(app.getHttpServer())
      .post('/dealers')
      .send(dealerRequest1);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      name: 'Leonardo Iago Jesus',
      email: 'leonardo@gmail.com',
      cpf: '26121932007',
      password: expect.any(String),
      id: expect.any(String),
      createdDate: expect.any(String),
      updatedDate: expect.any(String),
      deletedDate: null,
    });

    const response2 = await request(app.getHttpServer())
      .post('/dealers')
      .send(dealerRequest2);

    expect(response2.status).toBe(400);
    expect(response2.body).toEqual({
      type: 'MongoError',
      value: {
        field: 'IDX',
        value: ': "26121932007"',
        type: 'unique',
      },
    });
  });

  it('POST /dealers [should have status 400 on invalid cpf]', async () => {
    const dealerRequest = {
      name: 'Leonardo Iago Jesus',
      email: 'leonardo@gmail.com',
      cpf: '261.219.320-02',
      password: 'Teste01**',
    };
    const response = await request(app.getHttpServer())
      .post('/dealers')
      .send(dealerRequest);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: ['Invalid cpf'],
      error: 'Bad Request',
    });
  });

  it('POST /dealers [should have status 400 on invalid email]', async () => {
    const dealerRequest = {
      name: 'Leonardo Iago Jesus',
      email: 'leonardo@gmail.',
      cpf: '261.219.320-07',
      password: 'Teste01**',
    };
    const response = await request(app.getHttpServer())
      .post('/dealers')
      .send(dealerRequest);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: ['email must be an email'],
      error: 'Bad Request',
    });
  });

  it('POST /dealers [should have status 400 on empty email]', async () => {
    const dealerRequest = {
      name: 'Leonardo Iago Jesus',
      cpf: '261.219.320-07',
      password: 'Teste01**',
    };
    const response = await request(app.getHttpServer())
      .post('/dealers')
      .send(dealerRequest);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: ['email should not be empty', 'email must be an email'],
      error: 'Bad Request',
    });
  });

  it('POST /dealers [should have status 400 on empty cpf]', async () => {
    const dealerRequest = {
      name: 'Leonardo Iago Jesus',
      email: 'leonardo@gmail.br',
      password: 'Teste01**',
    };
    const response = await request(app.getHttpServer())
      .post('/dealers')
      .send(dealerRequest);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: [
        'cpf must match /^(\\d{3})[.]?(\\d{3})[.]?(\\d{3})[-]?(\\d{2})$/ regular expression',
        'cpf should not be empty',
        'Invalid cpf',
      ],
      error: 'Bad Request',
    });
  });

  it('POST /dealers [should have status 400 on empty name]', async () => {
    const dealerRequest = {
      email: 'leonardo@gmail.br',
      cpf: '261.219.320-07',
      password: 'Teste01**',
    };
    const response = await request(app.getHttpServer())
      .post('/dealers')
      .send(dealerRequest);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: ['name should not be empty'],
      error: 'Bad Request',
    });
  });

  it('POST /dealers [should have status 400 on empty password]', async () => {
    const dealerRequest = {
      name: 'Leonardo Iago Jesus',
      email: 'leonardo@gmail.br',
      cpf: '261.219.320-07',
    };
    const response = await request(app.getHttpServer())
      .post('/dealers')
      .send(dealerRequest);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: ['password should not be empty'],
      error: 'Bad Request',
    });
  });

  afterEach(async () => {
    await dealerRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });
});
