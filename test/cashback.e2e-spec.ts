import { CashbackModule } from './../src/modules/cashback/cashback.module';
import { applyGlobalToApp } from './test-helper';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { config as configDotEnv } from 'dotenv-safe';
configDotEnv();

describe('CashbackModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CashbackModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    applyGlobalToApp(app);
    await app.init();
  });

  it('GET /cashback/:cpf [shoud return valid cashback response]', async () => {
    const response = await request(app.getHttpServer())
      .get('/cashback/26121932007')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      body: {
        credit: expect.any(Number),
      },
    });
  });

  it('GET /cashback/:cpf [shoud have status 400 on invalid cpf]', async () => {
    const response = await request(app.getHttpServer())
      .get('/cashback/26121932005')
      .send();

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: 'Cpf inválido',
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
