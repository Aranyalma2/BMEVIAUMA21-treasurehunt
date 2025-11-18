import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';

import { LocationDto } from './location.dto';
import { TaskAnswerDto } from './task-answer.dto';

export class SubmitMissionDto {
  @ApiProperty({
    description: 'User location when submitting answer',
    type: LocationDto,
    example: {
      longitude: 19.0454,
      latitude: 47.5069,
    },
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({
    description: 'Task answer',
    type: TaskAnswerDto,
    example: {
      id: 1,
      answer: { answer: true },
    },
  })
  @IsDefined()
  @Type(() => TaskAnswerDto)
  task: TaskAnswerDto;
}
