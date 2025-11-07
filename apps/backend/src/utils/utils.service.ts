import { Injectable } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateOrReject, ValidatorOptions } from 'class-validator';

@Injectable()
export class UtilsService {
  /**
   * Validate an object with class-validator, type: dtoClass
   * @param dtoClass
   * @param jsonData
   * @returns Promise<T>
   */
  async validateObject<T extends object>(
    dtoClass: ClassConstructor<T>,
    object: unknown,
    options: ValidatorOptions = {},
  ): Promise<T> {
    const objectDto = plainToInstance(dtoClass, object);
    await validateOrReject(objectDto, options);
    return objectDto;
  }
}
