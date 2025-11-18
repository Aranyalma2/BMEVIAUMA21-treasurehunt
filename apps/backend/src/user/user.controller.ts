import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtUserDto } from 'src/auth/dto/jwt-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

import { ResponseUserDto } from './dto/response-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get loged in user object from DB' })
  @ApiResponse({ status: 200, type: ResponseUserDto, description: 'Queried user object' })
  @ApiResponse({ status: 404, description: 'User not found with ID' })
  getCurrentUser(@CurrentUser() user: JwtUserDto): Promise<ResponseUserDto> {
    return this.userService.findOne(Number(user.id));
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update loged in user object in DB' })
  @ApiResponse({ status: 200, type: ResponseUserDto, description: 'Update user object' })
  @ApiResponse({ status: 400, description: 'Email already exists' })
  @ApiResponse({ status: 404, description: 'User not found with ID' })
  updateCurrentUser(@CurrentUser() user: JwtUserDto, @Body() updateUserDto: UpdateUserDto): Promise<ResponseUserDto> {
    return this.userService.update(Number(user.id), updateUserDto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({ status: 200, description: 'User account deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found with ID' })
  async deleteCurrentUser(@CurrentUser() user: JwtUserDto): Promise<{ message: string }> {
    await this.userService.remove(Number(user.id));
    return { message: 'User account deleted successfully' };
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all user object from DB', description: 'ADMIN role necessary' })
  @ApiResponse({ status: 200, type: ResponseUserDto, isArray: true, description: 'Queried user objects' })
  findAll(): Promise<ResponseUserDto[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get user object from DB', description: 'ADMIN role necessary' })
  @ApiParam({ name: 'id', description: 'User ID', required: true, type: 'number' })
  @ApiResponse({ status: 200, type: ResponseUserDto, description: 'Queried user object' })
  @ApiResponse({ status: 404, description: 'User not found with ID' })
  findOne(@Param('id') id: string): Promise<ResponseUserDto> {
    return this.userService.findOne(Number(id));
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update user object in DB',
    description: 'ADMIN role necessary. The role is not changeable for yourself! ',
  })
  @ApiParam({ name: 'id', description: 'User ID', required: true, type: 'number' })
  @ApiResponse({ status: 200, type: ResponseUserDto, description: 'Update user object' })
  @ApiResponse({ status: 400, description: 'Username or email already exists' })
  @ApiResponse({ status: 404, description: 'User not found with ID' })
  update(
    @CurrentUser() user: JwtUserDto,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserAdminDto,
  ): Promise<ResponseUserDto> {
    if (user.id === Number(id) && updateUserDto.role) {
      delete updateUserDto.role;
    }
    return this.userService.update(Number(id), updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete a specific user',
    description: 'ADMIN role necessary',
  })
  @ApiParam({ name: 'id', description: 'User ID', required: true, type: 'number' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found with ID' })
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.remove(Number(id));
    return { message: 'User deleted successfully' };
  }
}
