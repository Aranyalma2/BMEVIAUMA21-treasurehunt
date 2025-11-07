import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ResponseUserDto } from 'src/user/dto/response-user.dto';
import { UserService } from 'src/user/user.service';

import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtUserDto } from './dto/jwt-user.dto';
import { TokenDto } from './dto/token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Authenticate user by username + password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'user1', description: 'The username of the user' },
        password: { type: 'string', example: 'password', description: 'The password of the user' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User authenticated', type: TokenDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Request() req): Promise<TokenDto> {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, type: ResponseUserDto, description: 'Created user object' })
  @ApiResponse({ status: 400, description: 'Username or email already exists' })
  async create(@Body() createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    return this.userService.create(createUserDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'JWT token user object' })
  me(@CurrentUser() user: JwtUserDto): JwtUserDto {
    return user;
  }
}
