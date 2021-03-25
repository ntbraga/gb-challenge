import { CreateDealerDTO } from 'src/data/dto/Dealer.dto';
import { Dealer } from 'src/data/entities/Dealer.entity';
import { DealerService } from './../../services/dealer/dealer.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DealerController } from './dealer.controller';

describe('DealerController', () => {
  let dealerController: DealerController;
  let dealerService: DealerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DealerService,
          useValue: new DealerService(null),
        },
      ],
      controllers: [DealerController],
    }).compile();

    dealerController = module.get<DealerController>(DealerController);
    dealerService = module.get<DealerService>(DealerService);
  });

  it('should be defined [dealerController]', () => {
    expect(dealerController).toBeDefined();
  });

  it('should be defined [dealerService]', () => {
    expect(dealerService).toBeDefined();
  });

  it('should create dealer', async () => {
    const dto = CreateDealerDTO.createDto(
      'Test user',
      'test@test.com.br',
      '12312312323',
      'Teste01*',
    );
    const entity = Dealer.fromDto(dto);

    jest
      .spyOn(dealerService, 'create')
      .mockImplementation(() => Promise.resolve(entity));
    await expect(dealerController.create(dto)).resolves.toBe(entity);
  });
});
