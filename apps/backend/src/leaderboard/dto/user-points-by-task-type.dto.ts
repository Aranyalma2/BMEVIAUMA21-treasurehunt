import { ApiProperty } from '@nestjs/swagger';
import { TaskType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, ValidateNested } from 'class-validator';

import { UserPointsDto } from './user-points.dto';

export class UserPointsByTaskTypeDto {
  @ApiProperty({
    description: 'Task type',
    enum: TaskType,
  })
  @IsEnum(TaskType)
  type: TaskType;

  @ApiProperty({
    description: 'User points for this task type',
    type: [UserPointsDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserPointsDto)
  userPoints: UserPointsDto[];
}
