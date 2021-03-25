import { PurchaseService } from './../src/modules/purchase/services/purchase/purchase.service';
import { PurchaseStatus } from './../src/data/dto/Purchase.dto';
import { CreateDealerDTO } from './../src/data/dto/Dealer.dto';
import { TypeormForTest, applyGlobalToApp } from './test-helper';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection, MongoRepository } from 'typeorm';
import { Dealer } from 'src/data/entities/Dealer.entity';
import { Purchase } from 'src/data/entities/Purchase.entity';
import { config as configDotEnv } from 'dotenv-safe';
import { PurchaseModule } from 'src/modules/purchase/purchase.module';
configDotEnv();

describe('PurchaseModule (e2e)', () => {
  let app: INestApplication;
  let dealerRepository: MongoRepository<Dealer>;
  let purchaseRepository: MongoRepository<Purchase>;
  let purchaseService: PurchaseService;
  let connection: Connection;

  const cashbackRules = [
    { min: 0, max: 1000, perc: 0.1 },
    { min: 1000, max: 1500, perc: 0.15 },
    { min: 1500, perc: 0.2 },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeormForTest(), PurchaseModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    applyGlobalToApp(app);
    await app.init();

    purchaseService = moduleFixture.get<PurchaseService>(PurchaseService);
    connection = moduleFixture.get<Connection>(Connection);
    dealerRepository = moduleFixture.get(
      getRepositoryToken(Dealer, connection),
    );
    purchaseRepository = moduleFixture.get(
      getRepositoryToken(Purchase, connection),
    );
  });

  beforeEach(() => {
    purchaseService.cashbackRules = cashbackRules;
  });

  const createDealer = (cpf: string) => {
    const entity = Dealer.fromDto(
      CreateDealerDTO.createDto(
        'Test dealer',
        'test@test.com.br',
        cpf,
        'Test01**',
      ),
    );
    return dealerRepository.save(entity);
  };

  const createPurchase = async (
    dealer: Dealer,
    cod = '001',
    value = 1200,
    status?: PurchaseStatus,
  ) => {
    const requestBody = {
      cod,
      value,
      date: '25/03/2021',
      cpf: dealer.cpf,
      status,
    };
    const response = await request(app.getHttpServer())
      .post('/purchases')
      .send(requestBody);

    return response.body;
  };

  beforeEach(async () => {
    await connection.synchronize(true);
    process.env.AUTO_APPROVE_CPF = '15350946056';
  });

  it('POST /purchases [should create purchase with status approved]', async () => {
    const dealer = await createDealer(process.env.AUTO_APPROVE_CPF);

    const requestBody = {
      cod: '001',
      value: 1200.0,
      date: '25/03/2021',
      cpf: dealer.cpf,
    };

    const response = await request(app.getHttpServer())
      .post('/purchases')
      .send(requestBody);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      cod: requestBody.cod,
      value: requestBody.value,
      date: requestBody.date,
      cpf: requestBody.cpf,
      status: 'APPROVED',
      createdDate: expect.any(String),
      updatedDate: expect.any(String),
      deletedDate: null,
      id: expect.any(String),
    });
  });

  it('POST /purchases [should create purchase with status validating]', async () => {
    const dealer = await createDealer('22697357068');

    const requestBody = {
      cod: '001',
      value: 1200.0,
      date: '25/03/2021',
      cpf: dealer.cpf,
    };

    const response = await request(app.getHttpServer())
      .post('/purchases')
      .send(requestBody);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      cod: requestBody.cod,
      value: requestBody.value,
      date: requestBody.date,
      cpf: requestBody.cpf,
      status: 'VALIDATING',
      createdDate: expect.any(String),
      updatedDate: expect.any(String),
      deletedDate: null,
      id: expect.any(String),
    });
  });

  it('POST /purchases [should have status 400 on invalid cpf]', async () => {
    const requestBody = {
      cod: '001',
      value: 1200.0,
      date: '25/03/2021',
      cpf: '15350946050',
    };

    const response = await request(app.getHttpServer())
      .post('/purchases')
      .send(requestBody);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: ['Invalid cpf'],
      error: 'Bad Request',
    });
  });

  it('POST /purchases [should have status 400 on inexistent cpf]', async () => {
    const requestBody = {
      cod: '001',
      value: 1200.0,
      date: '25/03/2021',
      cpf: '15350946056',
    };

    const response = await request(app.getHttpServer())
      .post('/purchases')
      .send(requestBody);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message:
        'Não é possível criar esta compra, revendedor com o cpf 15350946056 não existe',
    });
  });

  it('POST /purchases [should have status 400 on empty cod]', async () => {
    const requestBody = {
      cod: '',
      value: 1200.0,
      date: '25/03/2021',
      cpf: '15350946056',
    };

    const response = await request(app.getHttpServer())
      .post('/purchases')
      .send(requestBody);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: ['cod should not be empty'],
      error: 'Bad Request',
    });
  });

  it('POST /purchases [should have status 400 on empty value]', async () => {
    const requestBody = {
      cod: '001',
      date: '25/03/2021',
      cpf: '15350946056',
    };

    const response = await request(app.getHttpServer())
      .post('/purchases')
      .send(requestBody);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: [
        'value must be a number conforming to the specified constraints',
        'value must not be less than 0',
        'value should not be empty',
      ],
      error: 'Bad Request',
    });
  });

  it('POST /purchases [should have status 400 on value less than 0]', async () => {
    const requestBody = {
      cod: '001',
      value: -1,
      date: '25/03/2021',
      cpf: '15350946056',
    };

    const response = await request(app.getHttpServer())
      .post('/purchases')
      .send(requestBody);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: ['value must not be less than 0'],
      error: 'Bad Request',
    });
  });

  it('POST /purchases [should have status 400 on invalid value]', async () => {
    const requestBody = {
      cod: '001',
      value: 'a',
      date: '25/03/2021',
      cpf: '15350946056',
    };

    const response = await request(app.getHttpServer())
      .post('/purchases')
      .send(requestBody);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: [
        'value must be a number conforming to the specified constraints',
        'value must not be less than 0',
      ],
      error: 'Bad Request',
    });
  });

  it('POST /purchases [should have status 400 on empty date]', async () => {
    const requestBody = {
      cod: '001',
      value: 1200,
      cpf: '15350946056',
    };

    const response = await request(app.getHttpServer())
      .post('/purchases')
      .send(requestBody);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: ['Invalid date', 'date should not be empty'],
      error: 'Bad Request',
    });
  });

  it('POST /purchases [should have status 400 on duplicated cod and cpf]', async () => {
    const dealer = await createDealer('22697357068');

    const requestBody1 = {
      cod: '001',
      value: 1200.0,
      date: '25/03/2021',
      cpf: dealer.cpf,
    };

    const response1 = await request(app.getHttpServer())
      .post('/purchases')
      .send(requestBody1);

    expect(response1.status).toBe(201);
    expect(response1.body).toEqual({
      cod: requestBody1.cod,
      value: requestBody1.value,
      date: requestBody1.date,
      cpf: requestBody1.cpf,
      status: 'VALIDATING',
      createdDate: expect.any(String),
      updatedDate: expect.any(String),
      deletedDate: null,
      id: expect.any(String),
    });

    const requestBody2 = {
      cod: '001',
      value: 1300.0,
      date: '25/03/2021',
      cpf: dealer.cpf,
    };

    const response2 = await request(app.getHttpServer())
      .post('/purchases')
      .send(requestBody2);

    expect(response2.status).toBe(400);
    expect(response2.body).toEqual({
      type: 'MongoError',
      value: {
        field: 'UQ',
        value: ': "001", : "22697357068"',
        type: 'unique',
      },
    });
  });

  it('POST /purchases [should have status 400 on insert with status]', async () => {
    const requestBody = {
      cod: '001',
      value: 1200,
      date: '24/03/2021',
      cpf: '15350946056',
      status: 'APPROVED',
    };

    const response = await request(app.getHttpServer())
      .post('/purchases')
      .send(requestBody);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: ['status must be empty'],
      error: 'Bad Request',
    });
  });

  it('PUT /purchases [should update purchase value]', async () => {
    const dealer = await createDealer('22697357068');
    const purchase = await createPurchase(dealer);

    const updateRequest = {
      cod: purchase.cod,
      cpf: purchase.cpf,
      value: 2000,
    };

    const response = await request(app.getHttpServer())
      .put('/purchases')
      .send(updateRequest);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: purchase.id,
      cod: purchase.cod,
      date: purchase.date,
      value: 2000,
      cpf: purchase.cpf,
      status: purchase.status,
      createdDate: purchase.createdDate,
      updatedDate: expect.any(String),
      deletedDate: null,
    });
  });

  it('PUT /purchases [should update purchase date]', async () => {
    const dealer = await createDealer('22697357068');
    const purchase = await createPurchase(dealer);

    const updateRequest = {
      cod: purchase.cod,
      cpf: purchase.cpf,
      date: '25/03/2021',
    };

    const response = await request(app.getHttpServer())
      .put('/purchases')
      .send(updateRequest);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: purchase.id,
      cod: purchase.cod,
      date: '25/03/2021',
      value: purchase.value,
      cpf: purchase.cpf,
      status: purchase.status,
      createdDate: purchase.createdDate,
      updatedDate: expect.any(String),
      deletedDate: null,
    });
  });

  it('PUT /purchases [should have status 400 on update to negative value]', async () => {
    const dealer = await createDealer('22697357068');
    const purchase = await createPurchase(dealer);

    const updateRequest = {
      cod: purchase.cod,
      cpf: purchase.cpf,
      value: -100,
    };

    const response = await request(app.getHttpServer())
      .put('/purchases')
      .send(updateRequest);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: ['value must not be less than 0'],
      error: 'Bad Request',
    });
  });

  it('PUT /purchases [should have status 400 on update to invalid date]', async () => {
    const dealer = await createDealer('22697357068');
    const purchase = await createPurchase(dealer);

    const updateRequest = {
      cod: purchase.cod,
      cpf: purchase.cpf,
      date: '24/13/2021',
    };

    const response = await request(app.getHttpServer())
      .put('/purchases')
      .send(updateRequest);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: ['Invalid date'],
      error: 'Bad Request',
    });
  });

  it('PUT /purchases [should have status 400 on update not found]', async () => {
    const updateRequest = {
      cod: '001',
      cpf: '22697357068',
      date: '24/03/2021',
    };

    const response = await request(app.getHttpServer())
      .put('/purchases')
      .send(updateRequest);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      statusCode: 404,
      message: 'Não foi encontrada uma compra com código: 001',
    });
  });

  it('PUT /purchases [should have status 400 on update APPROVED]', async () => {
    const dealer = await createDealer(process.env.AUTO_APPROVE_CPF);
    const purchase = await createPurchase(dealer);

    const updateRequest = {
      cod: purchase.cod,
      cpf: purchase.cpf,
      date: '24/03/2021',
    };
    const response = await request(app.getHttpServer())
      .put('/purchases')
      .send(updateRequest);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message:
        'Não é possível atualizar esta compra, status diferente de "Em validação"',
    });
  });

  it('DELETE /purchases/:cpf/:cod [should delete purchase]', async () => {
    const dealer = await createDealer('22697357068');
    const purchase = await createPurchase(dealer);
    const response = await request(app.getHttpServer())
      .delete(`/purchases/${purchase.cpf}/${purchase.cod}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({});
  });

  it('DELETE /purchases/:cpf/:cod [should have status 404 on not found]', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/purchases/22697357068/001`)
      .send();

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      statusCode: 404,
      message: 'Não foi encontrada uma compra com código: 001',
    });
  });

  it('DELETE /purchases/:cpf/:cod [should have status 400 on APPROVED]', async () => {
    const dealer = await createDealer(process.env.AUTO_APPROVE_CPF);
    const purchase = await createPurchase(dealer);

    const response = await request(app.getHttpServer())
      .delete(`/purchases/${purchase.cpf}/${purchase.cod}`)
      .send();

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message:
        'Não é possível excluir esta compra, status diferente de "Em validação"',
    });
  });

  it('GET /purchases/:cpf [should return 0 results]', async () => {
    const response = await request(app.getHttpServer())
      .get(`/purchases/22697357068`)
      .send();
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('GET /purchases/:cpf [should have status 400 on invalid cpf]', async () => {
    const response = await request(app.getHttpServer())
      .get(`/purchases/22697357069`)
      .send();
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ statusCode: 400, message: 'Cpf inválido' });
  });

  it('GET /purchases/:cpf [should return with righ cashback and status "Aprovado"]', async () => {
    const dealer = await createDealer(process.env.AUTO_APPROVE_CPF);
    await createPurchase(dealer, '001', 100);
    await createPurchase(dealer, '002', 1200);
    await createPurchase(dealer, '003', 1800);

    const response = await request(app.getHttpServer())
      .get(`/purchases/${process.env.AUTO_APPROVE_CPF}`)
      .send();
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        cod: '001',
        value: 100,
        date: '25/03/2021',
        appliedPercentage: '10%',
        cashback: 10,
        status: 'Aprovado',
      },
      {
        cod: '002',
        value: 1200,
        date: '25/03/2021',
        appliedPercentage: '15%',
        cashback: 180,
        status: 'Aprovado',
      },
      {
        cod: '003',
        value: 1800,
        date: '25/03/2021',
        appliedPercentage: '20%',
        cashback: 360,
        status: 'Aprovado',
      },
    ]);
  });

  it('GET /purchases/:cpf [should return with righ cashback and status "Em Validação"]', async () => {
    const dealer = await createDealer('22697357068');
    await createPurchase(dealer, '001', 100);
    await createPurchase(dealer, '002', 1200);
    await createPurchase(dealer, '003', 1800);

    const response = await request(app.getHttpServer())
      .get(`/purchases/22697357068`)
      .send();
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        cod: '001',
        value: 100,
        date: '25/03/2021',
        appliedPercentage: '10%',
        cashback: 10,
        status: 'Em Validação',
      },
      {
        cod: '002',
        value: 1200,
        date: '25/03/2021',
        appliedPercentage: '15%',
        cashback: 180,
        status: 'Em Validação',
      },
      {
        cod: '003',
        value: 1800,
        date: '25/03/2021',
        appliedPercentage: '20%',
        cashback: 360,
        status: 'Em Validação',
      },
    ]);
  });

  afterEach(async () => {
    await dealerRepository.clear();
    await purchaseRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });
});
