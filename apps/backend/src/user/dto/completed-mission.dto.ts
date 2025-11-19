import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Mission } from 'src/mission/entities/mission.entity';

export class CompletedMissionDto extends OmitType(Mission, [
  'status',
  'createdAt',
  'updatedAt',
  'approvedAt',
  'createdById',
  'approvedById',
  'taskId',
] as const) {
  @ApiProperty({
    description: 'Date when mission was completed',
    type: Date,
    example: '2025-11-19T12:00:00.000Z',
  })
  completedAt: Date;
}
