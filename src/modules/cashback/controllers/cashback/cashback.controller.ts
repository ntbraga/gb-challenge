import { CashbackService } from './../../services/cashback/cashback.service';
import { Controller, Get, Inject, Param } from '@nestjs/common';

@Controller('cashback')
export class CashbackController {
  constructor(
    @Inject(CashbackService) private cashbackService: CashbackService,
  ) {}

  @Get('/:cpf')
  async getCashback(@Param('cpf') cpf: string) {
    const response = await this.cashbackService.getCashback(cpf);
    return response.data;
  }
}
