import { ApiProperty } from '@nestjs/swagger';
import { Status, TaskType } from '@prisma/client';
import { IsDate, IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class Mission {
  @ApiProperty({
    description: 'The ID of the mission',
    type: Number,
  })
  @IsInt()
  id: number;

  @ApiProperty({
    description: 'The name of the mission',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The description of the mission',
    type: String,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Longitude coordinate of the mission location',
    type: Number,
  })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'Latitude coordinate of the mission location',
    type: Number,
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'The status of the mission',
    enum: Status,
    default: Status.PENDING,
  })
  @IsEnum(Status)
  status: Status;

  @ApiProperty({
    description: 'The date the mission was created',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'The date the mission was last updated',
  })
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    description: 'The date the mission was approved',
    required: false,
  })
  @IsOptional()
  @IsDate()
  approvedAt?: Date;

  @ApiProperty({
    description: 'The ID of the user who created the mission',
    type: Number,
  })
  @IsInt()
  createdById: number;

  @ApiProperty({
    description: 'The ID of the user who approved the mission',
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsInt()
  approvedById?: number;

  @ApiProperty({
    description: 'The ID of the associated task',
    type: Number,
  })
  @IsInt()
  taskId: number;
}
