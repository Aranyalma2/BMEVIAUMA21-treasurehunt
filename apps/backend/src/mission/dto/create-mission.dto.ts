import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { Mission } from '../entities/mission.entity';
import { LocationDto } from './location.dto';
import { TaskDto } from './task.dto';

class CreateMissionNested {
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

export class CreateMissionDto extends IntersectionType(PickType(Mission, ['name', 'description']), CreateMissionNested) {}
