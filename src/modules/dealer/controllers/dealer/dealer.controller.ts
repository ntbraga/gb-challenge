import { DealerService } from './../../services/dealer/dealer.service';
import {
  Body,
  Controller,
  Inject,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateDealerDTO } from 'src/data/dto/Dealer.dto';

@Controller('dealers')
export class DealerController {
  constructor(@Inject(DealerService) private dealerSevice: DealerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateDealerDTO) {
    return this.dealerSevice.create(createDto);
  }
}
