import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UserPointsDto {
  @ApiProperty({
    description: 'User name or username',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Total points earned',
    type: Number,
  })
  @IsNumber()
  points: number;
}
