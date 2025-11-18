import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class MissionExtractDto {
  @ApiProperty({
    description: 'Mission ID',
    type: Number,
    example: 1,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Mission name',
    type: String,
    example: 'Parliament Architecture Quiz',
  })
  @IsString()
  name: string;

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

  @ApiProperty({
    description: 'Mission description',
    type: String,
    example: 'Learn about the magnificent Hungarian Parliament Building!',
  })
  @IsString()
  description: string;
}
