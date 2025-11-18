import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ArrayUnique } from 'class-validator';

export class SystemRolesDto {
  @ApiProperty({
    description: 'The roles in the system',
    type: [String],
    example: ['ADMIN', 'USER'],
  })
  @ArrayUnique()
  roles: Role[] = [];
}
