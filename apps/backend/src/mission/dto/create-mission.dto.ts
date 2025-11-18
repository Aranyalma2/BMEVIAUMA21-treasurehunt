import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

import { LocationDto } from './location.dto';
import { TaskDto } from './task.dto';

export class CreateMissionDto {
  @ApiProperty({
    description: 'Mission name',
    type: String,
    example: 'Parliament Architecture Quiz',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Mission description',
    type: String,
    example: 'Learn about the magnificent Hungarian Parliament Building and test your knowledge!',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Mission location',
    type: LocationDto,
    example: {
      longitude: 19.0454,
      latitude: 47.5069,
    },
  })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({
    description: 'Mission task',
    type: TaskDto,
    example: {
      type: 'TRUE_OR_FALSE',
      derivativeTask: {
        question: 'The Hungarian Parliament Building was completed in 1902. True or False?',
        answer: true,
      },
    },
  })
  @ValidateNested()
  @Type(() => TaskDto)
  task: TaskDto;
}
