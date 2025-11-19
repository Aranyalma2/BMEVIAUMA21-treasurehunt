import { ApiProperty, OmitType } from '@nestjs/swagger';

import { User } from '../entities/user.entity';

export class ResponseUserDto extends OmitType(User, ['password'] as const) {
  @ApiProperty({
    description: 'User score based on completed missions',
    type: Number,
    example: 5,
  })
  score?: number;

  @ApiProperty({
    description: 'Number of completed tasks',
    type: Number,
    example: 5,
  })
  completedTaskCount?: number;
}
