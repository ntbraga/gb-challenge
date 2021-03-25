import { clearCpfMask, validateCpf } from './../../../../utils/index';
import {
  HttpService,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Injectable()
export class CashbackService {
  constructor(private httpService: HttpService) {}

  async getCashback(cpf: string) {
    cpf = clearCpfMask(cpf);

    if (!(await validateCpf(cpf))) {
      throw new HttpException('Cpf inválido', HttpStatus.BAD_REQUEST);
    }

    return this.httpService
      .get(process.env.CASHBACK_API, {
        params: { cpf },
        headers: {
          [process.env.CASHBACK_API_HEADER]: process.env.CASHBACK_API_TOKEN,
        },
      })
      .toPromise();
  }
}
