import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({
    description: 'The access token',
    example: 'eyJhb.....',
    type: 'string',
  })
  access_token: string;
}
