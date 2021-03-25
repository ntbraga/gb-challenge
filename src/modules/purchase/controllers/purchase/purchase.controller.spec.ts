import { PurchaseStatus } from 'src/data/dto/Purchase.dto';
import { Purchase } from './../../../../data/entities/Purchase.entity';
import {
  CreatePurchaseDTO,
  UpdatePurchaseDTO,
} from './../../../../data/dto/Purchase.dto';
import { PurchaseService } from './../../services/purchase/purchase.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseController } from './purchase.controller';

describe('PurchaseController', () => {
  let purchaseController: PurchaseController;
  let purchaseService: PurchaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PurchaseService, useValue: new PurchaseService(null, null) },
      ],
      controllers: [PurchaseController],
    }).compile();

    purchaseController = module.get<PurchaseController>(PurchaseController);
    purchaseService = module.get<PurchaseService>(PurchaseService);
  });

  it('should be defined [purchaseController]', () => {
    expect(purchaseController).toBeDefined();
  });

  it('should be defined [purchaseService]', () => {
    expect(purchaseService).toBeDefined();
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
      .spyOn(purchaseService, 'create')
      .mockImplementation(() => Promise.resolve(entity));

    await expect(purchaseController.create(dto)).resolves.toBe(entity);
  });

  it('should update purchase', async () => {
    const dto = UpdatePurchaseDTO.createDto(
      '001',
      1200.3,
      '24/03/2021',
      '931.067.890-93',
    );

    const entity = Purchase.fromDto(dto);
    jest
      .spyOn(purchaseService, 'update')
      .mockImplementation(() => Promise.resolve(entity));

    await expect(purchaseController.update(dto)).resolves.toBe(entity);
  });

  it('should remove purchase', async () => {
    jest
      .spyOn(purchaseService, 'remove')
      .mockImplementation(() => Promise.resolve());

    await expect(purchaseController.remove('93106789093', '001')).resolves.toBe(
      undefined,
    );
  });

  it('should find all purchases', async () => {
    const entity = Purchase.createEntity(
      '001',
      100,
      '24/03/2021',
      '93106789093',
      PurchaseStatus.VALIDATING,
    );
    jest
      .spyOn(purchaseService, 'findAll')
      .mockImplementation(() => Promise.resolve([entity]));

    const result = await purchaseController.findAll('001');
    expect(result).toHaveLength(1);
    const r1 = result[0];

    expect(r1).toBeDefined();
  });
});
