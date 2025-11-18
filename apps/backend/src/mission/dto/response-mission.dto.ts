import { IntersectionType, OmitType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';

import { Mission } from '../entities/mission.entity';
import { TaskDto } from './task.dto';

class TaskProperty {
  @ApiProperty({
    description: 'Task associated with the mission',
    type: TaskDto,
  })
  task: TaskDto;
}

export class ResponseMissionDto extends IntersectionType(OmitType(Mission, ['taskId']), TaskProperty) {}
