import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { LocationDto } from './location.dto';

export class StartMissionDto {
  @ApiProperty({
    description: 'User location when starting mission',
    type: LocationDto,
    example: {
      longitude: 19.0454,
      latitude: 47.5069,
    },
  })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;
}
