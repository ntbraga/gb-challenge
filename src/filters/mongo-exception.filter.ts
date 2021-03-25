import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { MongoError } from 'mongodb';

const regexUnique = /E11000 duplicate key error collection: \S+ index: (\S+)_\S+ dup key: { (.+) }/;

const parseError = (exception: MongoError) => {
  if (exception.code == 11000) {
    const match = (exception.errmsg || exception.writeErrors[0].errmsg).match(
      regexUnique,
    );

    if (!match) {
      return exception;
    }

    return {
      field: match[1],
      value: match[2],
      type: 'unique',
    };
  }
};

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(400).json({
      type: 'MongoError',
      value: parseError(exception) || {},
    });
  }
}
