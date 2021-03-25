import { hashString, createTokenFromUser } from './../../../../utils/index';
import { Dealer } from 'src/data/entities/Dealer.entity';
import { LoginDTO } from './../../../../data/dto/Login.dto';
import { AuthService } from './../../services/auth/auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { ObjectID } from 'mongodb';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: new AuthService(null),
        },
      ],
      controllers: [AuthController],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined [authController]', () => {
    expect(authController).toBeDefined();
  });

  it('should be defined [authService]', () => {
    expect(authService).toBeDefined();
  });

  it('should do login', async () => {
    const loginDTO = LoginDTO.createDto('test@test.com.br', 'Test01*');
    const entity = new Dealer();
    entity.id = new ObjectID();
    entity.email = 'test@test.com.br';

    const token = createTokenFromUser(entity);

    const response = { ...entity.toJSON(), token };

    jest
      .spyOn(authService, 'login')
      .mockImplementation(() => Promise.resolve(response));

    await expect(authController.login(loginDTO)).resolves.toBe(response);
  });
});
