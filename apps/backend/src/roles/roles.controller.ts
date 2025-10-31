import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { SystemRolesDto } from './dto/roles.dto';
import { RolesService } from './roles.service';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiOkResponse({ type: SystemRolesDto, description: 'Get available roles.' })
  findAll() {
    return this.rolesService.getSystem();
  }
}
