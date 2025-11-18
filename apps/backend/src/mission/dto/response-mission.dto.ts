import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { TaskDto } from './task.dto';

export class ResponseMissionDto {
  @ApiProperty({
    description: 'Mission ID',
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Mission name',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Mission description',
    type: String,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Task associated with the mission',
    type: TaskDto,
  })
  task: TaskDto;

  @ApiProperty({
    description: 'Longitude coordinate',
    type: Number,
  })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'Latitude coordinate',
    type: Number,
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'Mission status',
    enum: Status,
  })
  @IsEnum(Status)
  status: Status;

  @ApiProperty({
    description: 'Creation date',
    type: Date,
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'ID of user who created the mission',
    type: Number,
  })
  @IsNumber()
  createdById: number;

  @ApiProperty({
    description: 'Approval date',
    type: Date,
    required: false,
  })
  @IsOptional()
  @IsDate()
  approvedAt?: Date;

  @ApiProperty({
    description: 'ID of user who approved the mission',
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  approvedById?: number;
}
