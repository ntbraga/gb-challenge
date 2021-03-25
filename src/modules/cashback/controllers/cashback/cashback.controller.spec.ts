import { CashbackService } from './../../services/cashback/cashback.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CashbackController } from './cashback.controller';
import { AxiosResponse } from 'axios';
describe('CashbackController', () => {
  let cashbackController: CashbackController;
  let cashbackService: CashbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: CashbackService, useValue: new CashbackService(null) },
      ],
      controllers: [CashbackController],
    }).compile();

    cashbackController = module.get<CashbackController>(CashbackController);
    cashbackService = module.get<CashbackService>(CashbackService);
  });

  it('should be defined [cashbackController]', () => {
    expect(cashbackController).toBeDefined();
  });

  it('should be defined [cashbackService]', () => {
    expect(cashbackService).toBeDefined();
  });

  it('should return 200', async () => {
    const result: AxiosResponse = {
      data: {
        statusCode: 200,
        body: {
          credit: 2374,
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };
    jest
      .spyOn(cashbackService, 'getCashback')
      .mockImplementation(() => Promise.resolve(result));
    const res = await cashbackController.getCashback('93106789093');
    expect(res).toEqual({
      statusCode: 200,
      body: {
        credit: expect.any(Number),
      },
    });
  });
});
