import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class LocationDto {
  @ApiProperty({
    description: 'Longitude coordinate',
    type: Number,
    example: 19.0454,
  })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'Latitude coordinate',
    type: Number,
    example: 47.5069,
  })
  @IsNumber()
  latitude: number;
}
