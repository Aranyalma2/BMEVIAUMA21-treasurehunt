import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsAlphanumeric,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class User {
  @ApiProperty({
    description: 'The ID of the user',
    type: Number,
  })
  @IsInt()
  id: number;

  @ApiProperty({
    description: 'The username of the user, used for login. Must be alphanumeric and between 5 and 20 characters',
    example: 'ExampleUsername',
    minimum: 5,
    maximum: 20,
    type: String,
  })
  @IsAlphanumeric()
  @MinLength(5)
  @MaxLength(20)
  username: string;

  @ApiProperty({
    description: 'The password of the user, used for login already hashed',
    example: 'ExamplePassword',
    type: String,
  })
  @IsString()
  @IsStrongPassword({
    minLength: 5,
    minLowercase: 0,
    minNumbers: 0,
    minSymbols: 0,
    minUppercase: 0,
  })
  password: string;

  @ApiPropertyOptional({
    description: 'The display name of the user',
    example: 'Example Name',
    type: String,
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'The role of the user',
    enum: Role,
    default: Role.USER,
  })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    description: 'The date the user was created',
  })
  @IsDateString()
  createdAt: Date;
}
