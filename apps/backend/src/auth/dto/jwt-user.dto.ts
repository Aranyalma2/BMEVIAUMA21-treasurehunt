import { ApiProperty, PickType } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';

export class JwtUserDto extends PickType(User, ['id', 'username', 'role']) {
  @ApiProperty({
    description: 'Token creation date',
    example: 1625730000,
    type: 'integer',
  })
  iat?: number;

  @ApiProperty({
    description: 'Token expiration date',
    example: 1625733600,
    type: 'integer',
  })
  exp?: number;
}
