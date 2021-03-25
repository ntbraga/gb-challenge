import { HttpModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CashbackService } from './cashback.service';
import { config as configDotEnv } from 'dotenv-safe';
configDotEnv();

describe('CashbackService', () => {
  let service: CashbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [CashbackService],
    }).compile();

    service = module.get<CashbackService>(CashbackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw invalid cpf', async () => {
    await expect(service.getCashback('00000000000')).rejects.toThrow(
      'Cpf inválido',
    );
  });

  it('should return 200', async () => {
    const res = await service.getCashback('15350946056');
    expect(res.status).toBe(200);
    expect(res.data).toBeDefined();
    expect(res.data.body).toBeDefined();
    expect(res.data.body.credit).toBeGreaterThan(0);
  });
});
