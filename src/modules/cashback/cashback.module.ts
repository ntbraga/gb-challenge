import { CashbackController } from './controllers/cashback/cashback.controller';
import { CashbackService } from './services/cashback/cashback.service';
import { HttpModule, Module } from '@nestjs/common';

@Module({
  imports: [HttpModule],
  providers: [CashbackService],
  controllers: [CashbackController],
})
export class CashbackModule {}
