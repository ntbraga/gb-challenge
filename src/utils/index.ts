import { Dealer } from './../data/entities/Dealer.entity';
import * as bcript from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { registerDecorator, ValidationOptions } from 'class-validator';
import * as moment from 'moment';

export const hashString = async (value: string) => {
  return bcript.hash(value, 10);
};

export const compareHashString = async (data: string, hash: string) => {
  return bcript.compare(data, hash);
};

export const createTokenFromUser = (user: Dealer) => {
  const secret = process.env.TOKEN_SECRET || 'SECRET';
  return jwt.sign({ data: user.id }, secret, {
    subject: user.id.toHexString(),
    audience: 'urn:auth',
    expiresIn: process.env.TOKEN_EXPIRES || '1h',
  });
};

export const clearCpfMask = (cpf: string) =>
  (cpf || '').replace(/[\s.-]*/gim, '');

export const parseDate = (date: string) => moment(date, 'DD/MM/YYYY');

const cpf_blacklist = [
  ...Array(10)
    .fill(0)
    .map((_, i) => Array(11).fill(i).join('')),
];

export const validateCpf = async (cpf: string) => {
  if (typeof cpf !== 'string') return false;
  cpf = clearCpfMask(cpf);
  if (!cpf || cpf.length != 11 || cpf_blacklist.includes(cpf)) {
    return false;
  }
  let soma = 0;
  for (let i = 1; i <= 9; i++)
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  let resto = (soma * 10) % 11;
  if (resto == 10 || resto == 11) resto = 0;
  if (resto != parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++)
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto == 10 || resto == 11) resto = 0;
  if (resto != parseInt(cpf.substring(10, 11))) return false;
  return true;
};

export function IsValidCpf(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object, propertyName: string) {
    registerDecorator({
      name: 'isValidCpf',
      target: object.constructor,
      propertyName: propertyName,
      options: { message: 'Invalid cpf', ...(validationOptions || {}) },
      validator: {
        validate(value: any) {
          return validateCpf(value);
        },
      },
    });
  };
}

export function IsLocalDate(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object, propertyName: string) {
    registerDecorator({
      name: 'isLocalDate',
      target: object.constructor,
      propertyName: propertyName,
      options: { message: 'Invalid date', ...(validationOptions || {}) },
      validator: {
        validate(value: any) {
          return parseDate(value).isValid();
        },
      },
    });
  };
}
